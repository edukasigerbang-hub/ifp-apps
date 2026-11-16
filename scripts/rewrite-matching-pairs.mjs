#!/usr/bin/env node
/**
 * Menulis ulang aktivitas mencocokkan yang isinya salinan persis langkah eksplorasi.
 *
 * Masalah (pra-review R5, 2026-10-26): 908 pasangan matching identik byte dengan
 * prompt+reveal langkah eksplorasi pada 184 paket, sehingga aktivitas itu mengulang
 * jawaban, bukan menilai ulang. Dua di antaranya bahkan bukan pasangan yang layak:
 *   - "Apa hal penting yang kamu pelajari tentang X?" (refleksi, 154 pasangan)
 *   - "Bagaimana urutan yang benar untuk X?" (76 pasangan; ke-76 paketnya sudah punya
 *     aktivitas mengurutkan, jadi urutan diuji dua kali)
 *
 * Transformasi:
 *   1. pasangan boilerplate dibuang, diganti pasangan authored dari scripts/data/
 *   2. pasangan substantif yang menyalin eksplorasi ditulis ulang menjadi
 *      "petunjuk ↔ jawaban": kalimat tanya diubah frasa petunjuk, jawaban kehilangan
 *      tanda titik akhirnya. Teks kiri/kanan tidak lagi identik dengan langkah.
 *   3. pasangan yang tidak bisa ditangani aturan dilaporkan sebagai residual supaya
 *      ditulis tangan, bukan dipaksa (hindar kalimat aneh).
 *
 * Jumlah item dinilai dipertahankan: pasangan yang dibuang = pasangan authored yang
 * dimasukkan. Deterministik dan idempoten.
 *
 * Pemakaian:
 *   node scripts/rewrite-matching-pairs.mjs                 # dry-run + residual
 *   node scripts/rewrite-matching-pairs.mjs --apply         # tulis ke paket
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const apply = process.argv.includes("--apply");
const packagesRoot = path.resolve("content/packages");
const authoredPath = path.resolve("scripts/data/matching-rewrite-2026-10-27.json");

const BOILER = [
  /^Apa hal penting yang kamu pelajari/,
  /^Bagaimana urutan yang benar untuk/
];

const MAX_RIGHT = 55;

const authoredData = existsSync(authoredPath)
  ? JSON.parse(readFileSync(authoredPath, "utf8"))
  : { pairOverrides: [], replacements: [] };
const authoredByPackage = new Map(
  (authoredData.replacements ?? []).map((entry) => [entry.packageId, entry])
);
const overrides = new Map(
  (authoredData.pairOverrides ?? []).map((entry) => [
    `${entry.left}\u0000${entry.right}`,
    entry
  ])
);

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Tambah kata depan petunjuk, tanpa menggandakannya ("Berapa banyak ..." → "Banyak banyak ..."). */
function withPrefix(prefix, rest) {
  const trimmed = rest.trim();
  if (trimmed.toLowerCase().startsWith(`${prefix.toLowerCase()} `)) return capitalize(trimmed);
  return capitalize(`${prefix} ${trimmed}`);
}

/** Ubah kalimat tanya menjadi frasa petunjuk. Mengembalikan null bila pola tak dikenal. */
function toClue(prompt) {
  const asked = prompt.trim().replace(/[?]$/, "").trim();
  // Isian: "Kalimat berita diakhiri ..." / "Angka untuk tujuh adalah ..."
  if (/\.\.\.$/.test(asked)) {
    const stem = asked.replace(/\.\.\.$/, "").replace(/\s+(adalah|yaitu|yakni)$/, "").trim();
    if (stem.length > 0) return capitalize(stem);
  }
  const raw = asked.replace(/\.$/, "").trim();
  // Perintah baca: "Baca kata bu-ku" → petunjuk suku kata
  const readWord = raw.match(/^Baca kata (.+)$/);
  if (readWord) return `Kata dari suku kata ${readWord[1]}`;
  const readSentence = raw.match(/^Baca kalimat (.+)$/);
  if (readSentence) return `Kalimat yang dibaca: ${readSentence[1]}`;
  const text = raw;
  // "Bahan apa yang dipakai?" → "Bahan yang dipakai" (petunjuk benda, bukan pertanyaan)
  const apaYang = text.match(/^(.+?) apa(?: saja)? yang (.+)$/);
  if (apaYang) return capitalize(`${apaYang[1]} yang ${apaYang[2]}`);
  const manaYang = text.match(/^(.+?) mana yang (.+)$/);
  if (manaYang) return capitalize(`${manaYang[1]} yang ${manaYang[2]}`);
  const patterns = [
    [/^Apa yang (.+)$/, (m) => withPrefix("Yang", m[1])],
    [/^Apakah (.+)$/, (m) => withPrefix("Yang benar tentang", m[1])],
    [/^Apa itu (.+)$/, (m) => capitalize(m[1])],
    [/^Apa (.+)$/, (m) => capitalize(m[1])],
    [/^Bagaimana (.+)$/, (m) => capitalize(m[1])],
    [/^Mengapa (.+)$/, (m) => withPrefix("Alasan", m[1])],
    [/^Ada berapa (.+)$/, (m) => withPrefix("Banyak", m[1])],
    [/^Berapa (.+)$/, (m) => withPrefix("Banyak", m[1])],
    [/^Mana yang (.+)$/, (m) => withPrefix("Yang", m[1])],
    [/^Siapa (.+)$/, (m) => capitalize(m[1])],
    [/^Kapan (.+)$/, (m) => withPrefix("Waktu", m[1])],
    [/^Contoh (.+)$/, (m) => capitalize(`Contoh ${m[1]}`)],
    [/^Sebutkan (.+)$/, (m) => capitalize(`Daftar ${m[1]}`)],
    [/^Di mana (.+)$/, (m) => withPrefix("Tempat", m[1])]
  ];
  for (const [pattern, build] of patterns) {
    const match = text.match(pattern);
    if (match) return build(match);
  }
  return null;
}

/** Bentuk jawaban dari reveal: hilangkan titik akhir. null bila masih terlalu panjang. */
function toAnswer(reveal) {
  const text = reveal.trim().replace(/\.$/, "").trim();
  if (text.length === 0 || text.length > MAX_RIGHT) return null;
  return text;
}

function isBoilerplate(left) {
  return BOILER.some((pattern) => pattern.test(left));
}

const summary = {
  packages: 0,
  packagesChanged: 0,
  mirroredBefore: 0,
  boilerplateRemoved: 0,
  rewritten: 0,
  overridesUsed: 0,
  residuals: [],
  belowFloor: [],
  replacementGaps: [],
  collisions: [],
  authoredUnused: []
};
const ITEM_FLOOR = 8;

function countAssessmentItems(activities) {
  return activities.reduce((total, activity) => {
    if (activity.type === "matching") return total + (activity.interactionConfig?.pairs?.length ?? 0);
    if (activity.type === "ordering") return total + (activity.interactionConfig?.items?.length ?? 0);
    if (["multiple-choice", "true-false", "short-answer"].includes(activity.type)) {
      return total + (activity.assessmentConfig?.questions?.length ?? 0);
    }
    return total;
  }, 0);
}

for (const dirName of readdirSync(packagesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^kelas[1-6]-/.test(entry.name))
  .map((entry) => entry.name)
  .sort()) {
  const dir = path.join(packagesRoot, dirName);
  const activityFiles = readdirSync(path.join(dir, "activities"))
    .filter((file) => file.endsWith(".json"))
    .sort();

  const loaded = activityFiles.map((file) => ({
    file,
    activity: JSON.parse(readFileSync(path.join(dir, "activities", file), "utf8"))
  }));

  const steps = loaded
    .filter((entry) => entry.activity.type === "exploration")
    .flatMap((entry) => entry.activity.interactionConfig?.steps ?? []);

  const matchingEntry = loaded.find((entry) => entry.activity.type === "matching");
  if (!matchingEntry) continue;
  summary.packages += 1;

  const pairs = matchingEntry.activity.interactionConfig?.pairs ?? [];
  const mirrored = pairs.filter(
    (pair) =>
      pair.left != null &&
      pair.right != null &&
      steps.some((step) => step.prompt === pair.left && step.reveal === pair.right)
  );
  if (mirrored.length === 0) continue;
  summary.mirroredBefore += mirrored.length;

  const entry = authoredByPackage.get(dirName);
  const nextPairs = [];
  let boilerRemoved = 0;
  let changed = false;

  for (const pair of pairs) {
    const isMirrored = mirrored.includes(pair);
    if (isMirrored && isBoilerplate(pair.left)) {
      boilerRemoved += 1;
      summary.boilerplateRemoved += 1;
      changed = true;
      continue;
    }
    if (!isMirrored) {
      nextPairs.push(pair);
      continue;
    }
    const override = overrides.get(`${pair.left}\u0000${pair.right}`);
    let clue = null;
    let answer = null;
    if (override) {
      clue = override.newLeft;
      answer = override.newRight;
      if (String(clue).length > 200 || String(answer).length > MAX_RIGHT) {
        clue = null;
        answer = null;
      }
    }
    if (clue === null) {
      clue = toClue(pair.left);
      answer = toAnswer(pair.right);
    }
    if (clue === null || answer === null || (clue === pair.left && answer === pair.right)) {
      summary.residuals.push({
        packageId: dirName,
        pairId: pair.pairId,
        left: pair.left,
        right: pair.right,
        reason: answer === null ? "jawaban terlalu panjang" : "pola petunjuk tidak dikenal"
      });
      nextPairs.push(pair);
      continue;
    }
    changed = true;
    if (override) summary.overridesUsed += 1;
    else summary.rewritten += 1;
    nextPairs.push({ ...pair, left: clue, right: answer });
  }

  const needed = boilerRemoved;
  const provided = entry?.pairs?.length ?? 0;
  for (let i = 0; i < needed && i < provided; i += 1) {
    const item = entry.pairs[i];
    nextPairs.push({
      pairId: `pasangan-${nextPairs.length + 1}`,
      left: item.left,
      right: item.right
    });
    changed = true;
  }
  if (needed > provided) {
    summary.replacementGaps.push({
      packageId: dirName,
      removed: needed,
      added: provided,
      shortfall: needed - provided
    });
  } else if (needed === 0 && provided > 0) {
    summary.authoredUnused.push({ packageId: dirName, needed, provided });
  }

  if (changed) {
    const projected = loaded.map((entry2) =>
      entry2 === matchingEntry
        ? { ...entry2.activity, interactionConfig: { ...entry2.activity.interactionConfig, pairs: nextPairs } }
        : entry2.activity
    );
    const itemsAfter = countAssessmentItems(projected);
    if (itemsAfter < ITEM_FLOOR) {
      summary.belowFloor.push({ packageId: dirName, itemsAfter, floor: ITEM_FLOOR });
    }
    const lefts = new Map();
    const rights = new Map();
    for (const pair of nextPairs) {
      const leftKey = pair.left.trim().toLowerCase();
      const rightKey = pair.right.trim().toLowerCase();
      lefts.set(leftKey, (lefts.get(leftKey) ?? 0) + 1);
      rights.set(rightKey, (rights.get(rightKey) ?? 0) + 1);
    }
    for (const [text, count] of lefts) {
      if (count > 1) summary.collisions.push({ packageId: dirName, side: "left", text, count });
    }
    for (const [text, count] of rights) {
      if (count > 1) summary.collisions.push({ packageId: dirName, side: "right", text, count });
    }
  }

  if (changed) {
    summary.packagesChanged += 1;
    if (apply) {
      const renumbered = nextPairs.map((pair, index) => ({ ...pair, pairId: `pasangan-${index + 1}` }));
      matchingEntry.activity.interactionConfig.pairs = renumbered;
      const anyQuestionLeft = renumbered.some((pair) => pair.left.trim().endsWith("?"));
      if (!anyQuestionLeft && /^Pasangkan setiap pertanyaan/.test(matchingEntry.activity.instructions ?? "")) {
        matchingEntry.activity.instructions = "Pasangkan setiap petunjuk dengan jawaban yang tepat.";
        const alt = matchingEntry.activity.accessibilityMetadata;
        if (alt && /^Aktivitas matching berjudul /.test(alt.altText ?? "")) {
          alt.altText = `Aktivitas matching berjudul "${matchingEntry.activity.title}": ${matchingEntry.activity.instructions}`;
        }
      }
      writeFileSync(
        path.join(dir, "activities", matchingEntry.file),
        `${JSON.stringify(matchingEntry.activity, null, 2)}\n`
      );
    }
  }
}

summary.authoredFile = existsSync(authoredPath) ? path.relative(process.cwd(), authoredPath) : "BELUM ADA";
console.log(
  JSON.stringify(
    {
      mode: apply ? "APPLY" : "DRY-RUN",
      packages: summary.packages,
      packagesChanged: summary.packagesChanged,
      mirroredBefore: summary.mirroredBefore,
      boilerplateRemoved: summary.boilerplateRemoved,
      rewritten: summary.rewritten,
      overridesUsed: summary.overridesUsed,
      residuals: summary.residuals.length,
      belowFloor: summary.belowFloor.length,
      replacementGaps: summary.replacementGaps.length,
      collisions: summary.collisions.length,
      authoredUnused: summary.authoredUnused.length,
      authoredFile: summary.authoredFile
    },
    null,
    2
  )
);

writeFileSync(
  path.resolve(".tmp-assets/matching-residuals.json"),
  JSON.stringify(
    {
      residuals: summary.residuals,
      belowFloor: summary.belowFloor,
      replacementGaps: summary.replacementGaps,
      collisions: summary.collisions,
      authoredUnused: summary.authoredUnused,
      boilerRemoved: summary.boilerplateRemoved
    },
    null,
    2
  )
);
