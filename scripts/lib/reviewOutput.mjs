/**
 * Opsi keluaran bersama untuk skrip review: tanggal sebagai argumen (default hari ini)
 * dan penjagaan agar bukti bertanggal yang sudah ada tidak tertimpa tanpa `--force`.
 */
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";

export function localDateStamp(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseReviewArgs(argv, { defaultOutDir = "knowledge/content" } = {}) {
  const options = { date: localDateStamp(), outDir: path.resolve(defaultOutDir), force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--date" || arg === "--out-dir") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${arg} memerlukan nilai`);
      index += 1;
      if (arg === "--out-dir") {
        options.outDir = path.resolve(value);
        continue;
      }
      const parsed = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw new Error(`--date harus tanggal valid YYYY-MM-DD, diterima: ${value}`);
      }
      options.date = value;
      continue;
    }
    throw new Error(`argumen tidak dikenal: ${arg} (didukung: --date YYYY-MM-DD, --out-dir DIR, --force)`);
  }
  return options;
}

export function ensureWritable(files, { force = false } = {}) {
  const existing = files.filter((file) => statSync(file, { throwIfNoEntry: false }));
  if (existing.length > 0 && !force) {
    throw new Error(
      `menolak menimpa berkas yang sudah ada (bukti historis):\n  ${existing.join("\n  ")}\n` +
        "Pakai --date lain, --out-dir lain, atau --force bila memang ingin menimpa."
    );
  }
  for (const file of files) mkdirSync(path.dirname(file), { recursive: true });
}
