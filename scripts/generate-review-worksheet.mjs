import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCatalogEntries } from "./lib/contentCatalog.mjs";

const subjectLabels = {
  matematika: "Matematika",
  "bahasa-indonesia": "Bahasa Indonesia",
  ipas: "IPAS",
  "pendidikan-pancasila": "Pendidikan Pancasila",
  "seni-rupa": "Seni Rupa",
  pjok: "PJOK",
  pai: "PAI"
};

const entries = buildCatalogEntries("content/packages")
  .map((entry) => ({
    ...entry,
    grade: Math.min(...entry.gradeLevels),
    subject: entry.subjects[0]
  }))
  .sort(
    (left, right) =>
      left.grade - right.grade ||
      left.subject.localeCompare(right.subject) ||
      left.lessonTitle.localeCompare(right.lessonTitle, "id")
  );

const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`;
const csvHeader = [
  "packageId",
  "grade",
  "subject",
  "lessonTitle",
  "activityCount",
  "reviewer",
  "R1",
  "R2",
  "R3",
  "R4",
  "R5",
  "R6",
  "R7",
  "R8",
  "R9",
  "R10",
  "R11",
  "R12",
  "notes",
  "reviewStatus"
];
const csvRows = entries.map((entry) =>
  [
    entry.packageId,
    entry.grade,
    subjectLabels[entry.subject] ?? entry.subject,
    entry.lessonTitle,
    entry.activityCount,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "BLOCKED-D6",
    "PASS (otomatis)",
    "",
    "",
    "draft"
  ]
    .map(csvEscape)
    .join(",")
);

const outDir = path.resolve("knowledge/release");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "review-worksheet-2026-10-25.csv"),
  `\uFEFF${[csvHeader.map(csvEscape).join(","), ...csvRows].join("\r\n")}\r\n`
);

const byGrade = new Map();
const bySubject = new Map();
for (const entry of entries) {
  byGrade.set(entry.grade, (byGrade.get(entry.grade) ?? 0) + 1);
  const label = subjectLabels[entry.subject] ?? entry.subject;
  bySubject.set(label, (bySubject.get(label) ?? 0) + 1);
}

const lines = [];
lines.push("# Lembar Kerja Review Pedagogis — 2026-10-25");
lines.push("");
lines.push("**Status:** `LEMBAR-KERJA` — bukan approval. Hanya reviewer manusia yang boleh menaikkan `reviewStatus`.");
lines.push("**Cakupan:** 320 paket draft (Kelas 1–6).");
lines.push("**Rubrik:** [REVIEW_RUBRIC.md](../content/REVIEW_RUBRIC.md)");
lines.push("**CSV siap isi:** [`review-worksheet-2026-10-25.csv`](review-worksheet-2026-10-25.csv)");
lines.push("");
lines.push("## Cara pakai");
lines.push("");
lines.push("1. Buka CSV di spreadsheet; satu baris = satu paket.");
lines.push("2. Isi `reviewer` (inisial) dan kolom `R1`–`R12` dengan `PASS` / `FAIL` / `N/A`.");
lines.push("3. Tulis temuan di `notes`; jika FAIL, buat tugas perbaikan.");
lines.push("4. Setelah diperbaiki dan direview ulang, ubah `reviewStatus` menjadi `reviewed`.");
lines.push("5. Perbarui [CATALOG.md](../content/CATALOG.md) hanya setelah formulir ditandatangani.");
lines.push("");
lines.push("## Aturan penilaian");
lines.push("");
lines.push("| Kolom | Siapa | Catatan |");
lines.push("|---|---|---|");
lines.push("| R1–R6, R8, R9, R12 | Reviewer manusia | Wajib penilaian ahli/bahasa |");
lines.push("| R7 | Reviewer + teknis | Alt text sudah teknis PASS; cek visual/manual |");
lines.push("| R10 | Curriculum Lead | **BLOCKED** sampai D6; jangan diisi PASS sebelum ada referensi resmi |");
lines.push("| R11 | Otomatis | Validator 320/320 PASS per 2026-10-25; reviewer boleh spot-check |");
lines.push("");
lines.push("## Ringkasan");
lines.push("");
lines.push(`- Total paket: **${entries.length}**`);
lines.push("");
lines.push("| Kelas | Paket |");
lines.push("|---|---:|");
for (const [grade, count] of [...byGrade.entries()].sort((a, b) => a[0] - b[0])) {
  lines.push(`| ${grade} | ${count} |`);
}
lines.push("");
lines.push("| Mapel | Paket |");
lines.push("|---|---:|");
for (const [subject, count] of [...bySubject.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`| ${subject} | ${count} |`);
}
lines.push("");
lines.push("## Beban kerja");
lines.push("");
lines.push("- Estimasi 20–30 menit/paket → **107–160 jam** total.");
lines.push("- 4 reviewer → sekitar **27–40 jam/orang** (belum termasuk perbaikan).");
lines.push("- Saran: 8–12 paket per sesi, satu mapel per sesi agar konteks tetap fokus.");
lines.push("");
lines.push("## Indeks paket");
lines.push("");

for (const [grade, count] of [...byGrade.entries()].sort((a, b) => a[0] - b[0])) {
  lines.push(`### Kelas ${grade} (${count} paket)`);
  lines.push("");
  lines.push("| No | packageId | Mapel | Lesson | Akt | Reviewer | Selesai |");
  lines.push("|---:|---|---|---|---:|---|---|");
  const gradeEntries = entries.filter((entry) => entry.grade === grade);
  gradeEntries.forEach((entry, index) => {
    lines.push(
      `| ${index + 1} | \`${entry.packageId}\` | ${subjectLabels[entry.subject] ?? entry.subject} | ${entry.lessonTitle} | ${entry.activityCount} |  | ☐ |`
    );
  });
  lines.push("");
}

lines.push("## Tanda tangan reviewer");
lines.push("");
lines.push("| Nama | Peran | Kelas/Mapel | Tanggal | Tanda tangan |");
lines.push("|---|---|---|---|---|");
lines.push("|  |  |  |  |  |");
lines.push("");
lines.push("> Lembar ini tidak boleh diisi otomatis oleh agen. Approval tanpa nama reviewer dan tanggal dianggap tidak sah.");
lines.push("");

writeFileSync(path.join(outDir, "REVIEW_WORKSHEET_2026-10-25.md"), lines.join("\n"));
console.log(`worksheet: ${entries.length} paket; CSV + MD ditulis`);
