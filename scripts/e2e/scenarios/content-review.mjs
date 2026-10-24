import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function invoke(page, command, args = {}) {
  return page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke(${JSON.stringify(command)}, ${JSON.stringify(args)})
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
}

async function clickButton(page, label) {
  const result = await page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")]
        .filter((button) => button.textContent.trim() === ${JSON.stringify(label)});
      const target = buttons.find((button) => button.offsetParent !== null) ?? buttons[0];
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Tombol "${label}" tidak dapat diklik (${result}).`);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const teacher = await invoke(page, "profile_create", {
    input: { displayName: "Bu Guru", profileType: "teacher" }
  });
  assert(teacher.ok, `Profil guru gagal dibuat: ${JSON.stringify(teacher.error)}`);
  const activated = await invoke(page, "profile_set_active", {
    profileId: teacher.value.id
  });
  assert(activated.ok, "Profil guru gagal diaktifkan.");
  log("Profil guru aktif.");

  const packagePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../content/packages/matematika-kelas3-pecahan"
  );
  const imported = await invoke(page, "content_import_package", {
    input: { sourcePath: packagePath }
  });
  assert(imported.ok, `Impor paket gagal: ${JSON.stringify(imported.error)}`);
  log(`Paket diimpor: ${imported.value.packageId} v${imported.value.version}.`);

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(`document.body.textContent.includes("Review konten")`, {
    label: "bagian review"
  });
  await page.waitFor(`document.querySelectorAll("section select option").length > 0`, {
    label: "daftar paket pada form review"
  });

  const notesFilled = await page.evaluate(`
    (() => {
      const textarea = document.querySelector("textarea");
      if (!textarea) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      ).set;
      setter.call(textarea, "Skema dan aset sudah diperiksa.");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()
  `);
  assert(notesFilled, "Catatan review tidak dapat diisi.");

  await clickButton(page, "Catat review");
  await page.waitFor(`document.body.textContent.includes("Review setuju tercatat")`, {
    label: "pesan review tercatat"
  });
  await page.waitFor(`document.body.textContent.includes("Disetujui (lokal)")`, {
    label: "badge review lokal"
  });
  log("Review setuju tercatat oleh guru dan tampil di daftar.");

  const reviews = await invoke(page, "review_list");
  assert(reviews.ok, "Daftar review gagal dibaca.");
  assert(reviews.value.length === 1, `Jumlah review: ${reviews.value.length}`);
  assert(reviews.value[0].reviewerName === "Bu Guru", "Nama reviewer tidak cocok.");
  assert(reviews.value[0].decision === "approved", "Keputusan review tidak cocok.");
  assert(
    reviews.value[0].notes === "Skema dan aset sudah diperiksa.",
    `Catatan review: ${reviews.value[0].notes}`
  );
  log("Audit review tersimpan dengan nama reviewer dan catatan.");

  const exportPath = path.join(artifactDir, "review-audit.csv");
  const exported = await invoke(page, "review_export_csv", { destination: exportPath });
  assert(exported.ok, `Ekspor review gagal: ${JSON.stringify(exported.error)}`);
  assert(exported.value.rows === 1, `Baris ekspor: ${exported.value.rows}`);
  const csv = await readFile(exportPath, "utf8");
  assert(csv.startsWith("\uFEFF"), "CSV tidak diawali BOM.");
  assert(csv.includes("\r\n"), "CSV tidak memakai CRLF.");
  assert(csv.includes("Bu Guru") && csv.includes("approved"), "Isi CSV tidak lengkap.");
  assert(
    csv.includes("Skema dan aset sudah diperiksa."),
    "Catatan review tidak ada di CSV."
  );
  log(`Audit review diekspor: ${exported.value.rows} baris, ${exported.value.bytes} byte.`);

  const student = await invoke(page, "profile_create", {
    input: { displayName: "Siswa Uji", profileType: "student" }
  });
  assert(student.ok, `Profil siswa gagal dibuat: ${JSON.stringify(student.error)}`);
  const switched = await invoke(page, "profile_set_active", {
    profileId: student.value.id
  });
  assert(switched.ok, "Gagal beralih ke profil siswa.");

  await clickButton(page, "Beranda");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label: "Beranda"
  });
  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(`document.body.textContent.includes("Hanya profil guru")`, {
    label: "batas review untuk siswa"
  });
  log("Profil siswa tidak melihat form review.");

  const forbidden = await invoke(page, "review_record", {
    input: {
      packageId: imported.value.packageId,
      packageVersion: imported.value.version,
      decision: "approved",
      notes: null
    }
  });
  assert(!forbidden.ok, "Siswa seharusnya tidak dapat mencatat review.");
  assert(
    forbidden.error?.code === "REVIEW_FORBIDDEN",
    `Kode error: ${JSON.stringify(forbidden.error)}`
  );
  log("Review oleh siswa ditolak native (REVIEW_FORBIDDEN).");

  const forbiddenExportPath = path.join(artifactDir, "review-audit-student.csv");
  const forbiddenExport = await invoke(page, "review_export_csv", {
    destination: forbiddenExportPath
  });
  assert(!forbiddenExport.ok, "Siswa seharusnya tidak dapat mengekspor audit review.");
  assert(
    forbiddenExport.error?.code === "REVIEW_FORBIDDEN",
    `Kode error ekspor: ${JSON.stringify(forbiddenExport.error)}`
  );
  log("Ekspor audit oleh siswa ditolak native (REVIEW_FORBIDDEN).");

  const after = await invoke(page, "review_list");
  assert(after.value.length === 1, "Jumlah review berubah setelah penolakan.");

  await page.screenshot(path.join(artifactDir, "content-review.png"));
  log("Screenshot review konten tersimpan.");
}
