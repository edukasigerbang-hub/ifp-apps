import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCatalogEntries } from "./lib/contentCatalog.mjs";

const packagesRoot = path.resolve("content/packages");
const outDir = path.resolve("knowledge/content");
mkdirSync(outDir, { recursive: true });

const subjectLabels = {
  matematika: "Matematika",
  "bahasa-indonesia": "Bahasa Indonesia",
  ipas: "IPAS",
  "pendidikan-pancasila": "Pendidikan Pancasila",
  "seni-rupa": "Seni Rupa",
  pjok: "PJOK",
  pai: "PAI"
};

const subjectSceneHints = {
  matematika:
    "countable classroom objects, geometric shapes, place-value blocks, fraction circles, measuring tools; use objects and shapes instead of numerals",
  "bahasa-indonesia":
    "children reading, open books, storytelling circle, blank speech bubbles without letters, writing tools",
  ipas:
    "plants, animals, human body model, water cycle, earth and space, simple science experiment tools",
  "pendidikan-pancasila":
    "Indonesian children cooperating, musyawarah circle, red-and-white flag, cultural diversity, five Pancasila symbols arranged decoratively",
  "seni-rupa":
    "art supplies, paint palette, brushes, colored paper collage, clay, simple gallery wall",
  pjok:
    "children exercising, balls, running track, cones, mats, playground, safe sports equipment",
  pai:
    "mosque silhouette, closed Quran on a rehal, prayer mat, dates and water, lantern; respectful, no depiction of prophets or God"
};

const negativePrompt =
  "text, letters, numbers, words, watermark, logo, signature, flat vector, 2D illustration, line art, cartoon drawing, photorealistic, hyperrealistic, realistic human proportions, uncanny, scary imagery, violence, religious disrespect, stereotypes, clutter, distorted hands, extra limbs";

const lowerGradeCoverStyle =
  "High-quality stylized 3D cartoon render, animated-film character design with oversized heads, large expressive eyes, soft rounded features, smooth matte clay-like materials, warm skin tones, cinematic studio lighting, soft shadows, subtle ambient occlusion, clean warm cream backdrop";
const upperGradeCoverStyle =
  "High-quality stylized 3D animated render, character design with age-appropriate proportions for older elementary children around 10 to 12 years old, expressive eyes, soft rounded features, smooth matte clay-like materials, warm skin tones, cinematic studio lighting, soft shadows, subtle ambient occlusion, clean warm cream backdrop";
const subjectCoverStyle =
  "High-quality stylized 3D animated still-life render, soft rounded shapes, smooth matte clay-like materials, cinematic studio lighting, soft shadows, subtle ambient occlusion, clean warm cream backdrop";
const lowerGradeMateriStyle =
  "High-quality stylized 3D cartoon render, animated-film character design with oversized heads, large expressive eyes, soft rounded features, smooth matte clay-like materials, warm skin tones, cinematic soft studio lighting, soft shadows, clean cream background";
const upperGradeMateriStyle =
  "High-quality stylized 3D animated render, character design with age-appropriate proportions for older elementary children around 10 to 12 years old, expressive eyes, soft rounded features, smooth matte clay-like materials, warm skin tones, cinematic soft studio lighting, soft shadows, clean cream background";

function isLowerGrade(grade) {
  const value = Number(grade);
  return Number.isFinite(value) && value >= 1 && value <= 3;
}

function materiStyleForGrade(grade) {
  return isLowerGrade(grade) ? lowerGradeMateriStyle : upperGradeMateriStyle;
}

function to3dCoverPrompt(prompt, grade) {
  const style = grade == null ? subjectCoverStyle : isLowerGrade(grade) ? lowerGradeCoverStyle : upperGradeCoverStyle;
  return prompt
    .replace(/ (?:Soft )?flat vector style, rounded shapes,/i, ` ${style},`)
    .replace(/ space at the top for a title overlay/i, " clean cream space at the top for a title overlay")
    .replace(/ negative space for a title overlay/i, " clean cream negative space for a title overlay")
    .replace(/ no text\.?$/i, " Consistent Indonesian school characters across images: white school uniform with red accents, friendly and respectful. Not flat, not vector, not 2D drawing. No text, no letters, no numbers, no watermark, no logo.");
}

const gradeCovers = [
  {
    grade: 1,
    title: "Kelas 1 — Awal Menjelajah",
    prompt:
      "Wide 16:9 cover illustration for grade 1 of an Indonesian elementary school learning app. Cheerful classroom corner with very young children exploring picture books, colorful counting blocks, crayons, and simple shapes. Soft flat vector style, rounded shapes, warm teal, orange, navy and cream palette, uncluttered composition with space at the top for a title overlay, diverse Indonesian children, respectful and friendly, no text."
  },
  {
    grade: 2,
    title: "Kelas 2 — Membaca dan Berhitung",
    prompt:
      "Wide 16:9 cover illustration for grade 2 of an Indonesian elementary school learning app. Children reading a big picture book, counting objects in small baskets, and playing with geometric shapes in a bright classroom with a plant by the window. Soft flat vector style, rounded shapes, warm teal, orange, navy and cream palette, space at the top for a title overlay, no text."
  },
  {
    grade: 3,
    title: "Kelas 3 — Menjelajah Alam",
    prompt:
      "Wide 16:9 cover illustration for grade 3 of an Indonesian elementary school learning app. Children observing a school garden, a butterfly life cycle poster with blank labels, fraction slices on a table, and a small globe. Soft flat vector style, rounded shapes, teal, green, orange and navy palette, space at the top for a title overlay, no text."
  },
  {
    grade: 4,
    title: "Kelas 4 — Berpikir dan Berkarya",
    prompt:
      "Wide 16:9 cover illustration for grade 4 of an Indonesian elementary school learning app. Children measuring a plant, reading a large book, arranging place-value blocks, and presenting a group project on a small stage. Soft flat vector style, rounded shapes, teal, orange, navy and cream palette, space at the top for a title overlay, no text."
  },
  {
    grade: 5,
    title: "Kelas 5 — Tubuh, Bumi, dan Angkasa",
    prompt:
      "Wide 16:9 cover illustration for grade 5 of an Indonesian elementary school learning app. Children exploring a simple human body model, a solar system mobile, a water cycle display, and a sports ball. Soft flat vector style, rounded shapes, teal, navy, orange and sky-blue palette, space at the top for a title overlay, no text."
  },
  {
    grade: 6,
    title: "Kelas 6 — Siap Melangkah",
    prompt:
      "Wide 16:9 cover illustration for grade 6 of an Indonesian elementary school learning app. Confident older children with books, a globe, a science project, a small flag, and a path leading forward. Soft flat vector style, rounded shapes, teal, navy, orange and cream palette, hopeful and calm mood, space at the top for a title overlay, no text."
  }
];

const subjectCovers = [
  {
    subject: "matematika",
    title: "Matematika",
    prompt:
      "Wide 16:9 subject cover for Mathematics in an Indonesian elementary learning app. Arrangement of geometric shapes, place-value blocks, fraction circles, an abacus, and a ruler on a clean cream background. Flat vector style, rounded shapes, teal, orange and navy palette, generous negative space for a title overlay, no text or numerals."
  },
  {
    subject: "bahasa-indonesia",
    title: "Bahasa Indonesia",
    prompt:
      "Wide 16:9 subject cover for Bahasa Indonesia in an Indonesian elementary learning app. Open storybook, blank speech bubbles, a pencil, and children listening to a story in a reading corner. Flat vector style, rounded shapes, teal, orange and cream palette, negative space for a title overlay, no letters or words."
  },
  {
    subject: "ipas",
    title: "IPAS",
    prompt:
      "Wide 16:9 subject cover for IPAS (integrated science) in an Indonesian elementary learning app. Nature elements, a plant with roots, a water cycle swirl, a small globe, a magnifying glass, and a simple experiment flask. Flat vector style, rounded shapes, teal, green, orange and navy palette, negative space for a title overlay, no text."
  },
  {
    subject: "pendidikan-pancasila",
    title: "Pendidikan Pancasila",
    prompt:
      "Wide 16:9 subject cover for Pendidikan Pancasila in an Indonesian elementary learning app. Five Pancasila symbols arranged decoratively — star, chain, banyan tree, bull head, rice and cotton — with diverse Indonesian children in a musyawarah circle and a small red-and-white flag. Flat vector style, rounded shapes, teal, gold, navy and cream palette, respectful, negative space for a title overlay, no text."
  },
  {
    subject: "seni-rupa",
    title: "Seni Rupa",
    prompt:
      "Wide 16:9 subject cover for Art in an Indonesian elementary learning app. Paint palette, brushes, colored paper collage pieces, clay shapes, and a small finished artwork on an easel. Flat vector style, rounded shapes, teal, orange, red, yellow and navy palette, negative space for a title overlay, no text."
  },
  {
    subject: "pjok",
    title: "PJOK",
    prompt:
      "Wide 16:9 subject cover for Physical Education in an Indonesian elementary learning app. Children stretching, a soccer ball, a badminton racket, a running track, and a gym mat in a safe outdoor field. Flat vector style, rounded shapes, teal, orange, green and navy palette, energetic but calm, negative space for a title overlay, no text."
  },
  {
    subject: "pai",
    title: "PAI",
    prompt:
      "Wide 16:9 subject cover for Islamic Religious Education in an Indonesian elementary learning app. Respectful scene with a mosque silhouette, a closed Quran on a wooden rehal, a prayer mat, dates and a water jar, and a crescent lantern. Flat vector style, rounded shapes, teal, gold, navy and cream palette, no depiction of prophets or God, negative space for a title overlay, no text."
  }
];

const entries = buildCatalogEntries("content/packages");
const inventory = [];
const hashUsage = new Map();

for (const entry of entries) {
  const dir = path.join(packagesRoot, entry.packageId);
  const manifest = JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8"));
  const asset = manifest.assets[0];
  const record = {
    packageId: entry.packageId,
    grade: Math.min(...entry.gradeLevels),
    subject: subjectLabels[entry.subjects[0]] ?? entry.subjects[0],
    subjectSlug: entry.subjects[0],
    lessonTitle: entry.lessonTitle,
    summary: entry.summary,
    assetPath: asset?.path ?? "",
    sizeBytes: asset?.sizeBytes ?? 0,
    sha256: asset?.sha256 ?? ""
  };
  inventory.push(record);
  if (record.sha256) {
    const list = hashUsage.get(record.sha256) ?? [];
    list.push(record.packageId);
    hashUsage.set(record.sha256, list);
  }
}

const reused = [...hashUsage.entries()]
  .filter(([, ids]) => ids.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`;

const inventoryHeader = [
  "packageId",
  "grade",
  "subject",
  "lessonTitle",
  "assetPath",
  "sizeBytes",
  "sha256",
  "usedByCount",
  "otherPackages"
];
const inventoryRows = inventory.map((record) => {
  const users = hashUsage.get(record.sha256) ?? [];
  return [
    record.packageId,
    record.grade,
    record.subject,
    record.lessonTitle,
    record.assetPath,
    record.sizeBytes,
    record.sha256,
    users.length,
    users.filter((id) => id !== record.packageId).join("; ")
  ]
    .map(csvEscape)
    .join(",");
});
writeFileSync(
  path.join(outDir, "asset-inventory-2026-10-25.csv"),
  `\uFEFF${[inventoryHeader.map(csvEscape).join(","), ...inventoryRows].join("\r\n")}\r\n`
);

const inventoryLines = [];
inventoryLines.push("# Inventaris Aset Konten — 2026-10-25");
inventoryLines.push("");
inventoryLines.push("**Status:** `INVENTARIS` — data dari manifest 320 paket.");
inventoryLines.push("**CSV lengkap:** [`asset-inventory-2026-10-25.csv`](asset-inventory-2026-10-25.csv)");
inventoryLines.push("");
inventoryLines.push("## Ringkasan");
inventoryLines.push("");
inventoryLines.push(`- Paket: **${inventory.length}**`);
inventoryLines.push(`- File aset: **${inventory.filter((record) => record.assetPath).length}**`);
inventoryLines.push(`- Hash unik: **${hashUsage.size}**`);
inventoryLines.push(`- Hash dipakai lebih dari satu paket: **${reused.length}**`);
inventoryLines.push(`- Semua aset saat ini: PNG **800×600** (4:3), dibuat deterministik.`);
inventoryLines.push("");
inventoryLines.push("## Aset yang dipakai ulang (prioritas diganti)");
inventoryLines.push("");
if (reused.length === 0) {
  inventoryLines.push("- Tidak ada.");
} else {
  inventoryLines.push("| Sha256 (8 awal) | Jumlah paket | Contoh paket |");
  inventoryLines.push("|---|---:|---|");
  for (const [hash, ids] of reused.slice(0, 20)) {
    inventoryLines.push(`| \`${hash.slice(0, 8)}\` | ${ids.length} | ${ids.slice(0, 3).map((id) => `\`${id}\``).join(", ")} |`);
  }
  if (reused.length > 20) inventoryLines.push(`| ... | ... | ${reused.length - 20} hash lainnya (lihat CSV) |`);
}
inventoryLines.push("");
inventoryLines.push("## Catatan");
inventoryLines.push("");
inventoryLines.push("- Aset dipakai ulang bukan otomatis salah, tetapi 61 hash lintas paket menunjukkan diferensiasi visual rendah.");
inventoryLines.push("- Aset materi baru sebaiknya 4:3 (1024×768 lalu downscale 800×600) agar cocok dengan Player.");
inventoryLines.push("- Cover kelas/mapel sebaiknya 16:9 (1792×1024) untuk tampilan IFP.");
inventoryLines.push("");
writeFileSync(path.join(outDir, "ASSET_INVENTORY_2026-10-25.md"), inventoryLines.join("\n"));

const promptRows = [];
for (const cover of gradeCovers) {
  promptRows.push({
    assetId: `cover-kelas-${cover.grade}`,
    type: "cover-kelas",
    grade: cover.grade,
    subject: "",
    title: cover.title,
    prompt: to3dCoverPrompt(cover.prompt, cover.grade),
    negativePrompt,
    aspectRatio: "16:9",
    suggestedFilename: `cover-kelas-${cover.grade}.webp`
  });
}
for (const cover of subjectCovers) {
  promptRows.push({
    assetId: `cover-mapel-${cover.subject}`,
    type: "cover-pelajaran",
    grade: "",
    subject: subjectLabels[cover.subject] ?? cover.subject,
    title: cover.title,
    prompt: to3dCoverPrompt(cover.prompt),
    negativePrompt,
    aspectRatio: "16:9",
    suggestedFilename: `cover-mapel-${cover.subject}.webp`
  });
}
for (const record of inventory) {
  const sceneHint = subjectSceneHints[record.subjectSlug] ?? "learning objects related to the topic";
  promptRows.push({
    assetId: `materi-${record.packageId}`,
    type: "image-materi",
    grade: record.grade,
    subject: record.subject,
    title: record.lessonTitle,
    prompt:
      `Educational illustration for grade ${record.grade} ${record.subject} in an Indonesian elementary school app, topic "${record.lessonTitle}". ${record.summary} Show ${sceneHint}. ${materiStyleForGrade(record.grade)}, child-friendly, culturally appropriate Indonesian context, diverse children when people are shown, respectful. Not flat, not vector, not 2D drawing. No text, no letters, no numbers, no watermark, no logo.`,
    negativePrompt,
    aspectRatio: "4:3",
    suggestedFilename: `materi-${record.packageId}.webp`
  });
}

const promptHeader = [
  "assetId",
  "type",
  "grade",
  "subject",
  "title",
  "prompt",
  "negativePrompt",
  "aspectRatio",
  "suggestedFilename"
];
const promptCsvRows = promptRows.map((row) =>
  promptHeader.map((key) => csvEscape(row[key] ?? "")).join(",")
);
writeFileSync(
  path.join(outDir, "asset-prompts-2026-10-25.csv"),
  `\uFEFF${[promptHeader.map(csvEscape).join(","), ...promptCsvRows].join("\r\n")}\r\n`
);

const promptLines = [];
promptLines.push("# Prompt Pack Aset — 2026-10-25");
promptLines.push("");
promptLines.push("**Status:** `SIAP-PAKAI` untuk Google Flow atau generator gambar lain.");
promptLines.push("**CSV lengkap:** [`asset-prompts-2026-10-25.csv`](asset-prompts-2026-10-25.csv)");
promptLines.push("");
promptLines.push("## Isi");
promptLines.push("");
promptLines.push(`- **Cover kelas:** ${gradeCovers.length} prompt (16:9)`);
promptLines.push(`- **Cover pelajaran:** ${subjectCovers.length} prompt (16:9)`);
promptLines.push(`- **Gambar materi:** ${inventory.length} prompt (4:3)`);
promptLines.push(`- **Total:** ${promptRows.length} prompt`);
promptLines.push("");
promptLines.push("## Gaya global");
promptLines.push("");
promptLines.push("- **Kelas 1–3:** stylized 3D ala film animasi — kepala besar, mata ekspresif, material matte lembut, cahaya studio.");
promptLines.push("- **Kelas 4–6:** gaya 3D yang sama dengan proporsi anak yang lebih matang (sekitar 10–12 tahun), bukan chibi.");
promptLines.push("- Karakter anak Indonesia konsisten: seragam putih dengan aksen merah, ramah dan sopan.");
promptLines.push("- Cover menampilkan adegan kelas/sekolah; materi menampilkan objek 3D sederhana di latar krem.");
promptLines.push("- Latar sederhana, ruang kosong untuk overlay judul (cover).");
promptLines.push("- Konteks Indonesia, anak beragam, sopan, aman untuk anak SD.");
promptLines.push("- **Tanpa teks/angka/logo/watermark**; angka divisualkan sebagai objek atau blok.");
promptLines.push("- Negative prompt sudah disertakan di setiap baris CSV.");
promptLines.push("");
promptLines.push("## Cara pakai di Google Flow");
promptLines.push("");
promptLines.push("1. Impor CSV ke spreadsheet; buat kolom bantu `finalPrompt = prompt + \"\\nAvoid: \" + negativePrompt`.");
promptLines.push("2. Generate cover lebih dulu (13 gambar), pilih yang konsisten, lalu jadikan referensi gaya.");
promptLines.push("3. Generate materi per batch 10–20, simpan dengan `suggestedFilename`.");
promptLines.push("4. Untuk cover: 16:9; untuk materi: 4:3. Flow mengembalikan WebP — simpan apa adanya.");
promptLines.push("5. Periksa tidak ada teks/logo yang tidak diinginkan sebelum dipakai.");
promptLines.push("");
promptLines.push("## Contoh prompt cover");
promptLines.push("");
for (const cover of gradeCovers.slice(0, 2)) {
  promptLines.push(`### ${cover.title}`);
  promptLines.push("");
  promptLines.push("```text");
  promptLines.push(to3dCoverPrompt(cover.prompt, cover.grade));
  promptLines.push("");
  promptLines.push(`Avoid: ${negativePrompt}`);
  promptLines.push("```");
  promptLines.push("");
}
promptLines.push("## Contoh prompt materi");
promptLines.push("");
for (const row of promptRows.filter((item) => item.type === "image-materi").slice(0, 3)) {
  promptLines.push(`### ${row.assetId}`);
  promptLines.push("");
  promptLines.push("```text");
  promptLines.push(row.prompt);
  promptLines.push("");
  promptLines.push(`Avoid: ${row.negativePrompt}`);
  promptLines.push("```");
  promptLines.push("");
}
promptLines.push("## Catatan kualitas");
promptLines.push("");
promptLines.push("- Prompt materi dibuat dari judul + ringkasan paket; hasil tetap harus diperiksa manusia.");
promptLines.push("- Jangan memakai gambar yang mengandung teks salah eja; overlay teks dilakukan aplikasi, bukan generator.");
promptLines.push("- Simpan metadata sumber/ lisensi gambar yang dipakai.");
promptLines.push("");
writeFileSync(path.join(outDir, "ASSET_PROMPTS_2026-10-25.md"), promptLines.join("\n"));

console.log(
  `assets: ${inventory.length} paket, ${hashUsage.size} hash unik, ${reused.length} reuse; prompts: ${promptRows.length}`
);
