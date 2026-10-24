import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

async function buildVersionTwo(artifactDir) {
  const source = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../content/packages/matematika-kelas3-pecahan"
  );
  const target = path.join(artifactDir, "content-v2");
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });

  const manifestPath = path.join(target, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.packageVersion = "0.2.0";
  manifest.title = "Pecahan Sederhana — E2E v2";
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const lessonPath = path.join(target, "lessons", "lesson-001.json");
  const lesson = JSON.parse(await readFile(lessonPath, "utf8"));
  lesson.title = "Mengenal Pecahan (E2E v2)";
  lesson.contentVersion = "0.2.0";
  await writeFile(lessonPath, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");

  return target;
}

async function importPackage(page, sourcePath) {
  const result = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("content_import_package", { input: { sourcePath: ${JSON.stringify(sourcePath)} } })
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
  assert(result.ok, `Impor gagal: ${JSON.stringify(result.error)}`);
  return result.value;
}

async function openPlayer(page) {
  await clickButton(page, "Player Pembelajaran");
  await page.waitFor(`document.body.textContent.includes("Tujuan pembelajaran")`, {
    label: "Player dimuat"
  });
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const v1Path = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../content/packages/matematika-kelas3-pecahan"
  );
  const v2Path = await buildVersionTwo(artifactDir);
  log(`Paket v2 disiapkan di ${v2Path}`);

  const v1 = await importPackage(page, v1Path);
  assert(v1.version === "0.1.0", `Versi awal ${v1.version}, harus 0.1.0.`);
  assert(v1.previousVersion === null, "Impor pertama tidak boleh punya versi sebelumnya.");
  log(`v${v1.version} diimpor (${v1.files} file).`);

  await openPlayer(page);
  await page.waitFor(`document.body.textContent.includes("Paket impor v0.1.0")`, {
    label: "badge v0.1.0"
  });
  await page.waitFor(
    `document.body.textContent.includes("Mengenal Pecahan 1/2, 1/3, dan 1/4")`,
    { label: "judul v0.1.0" }
  );
  log("Player menampilkan versi 0.1.0.");

  const v2 = await importPackage(page, v2Path);
  assert(v2.version === "0.2.0", `Versi kedua ${v2.version}, harus 0.2.0.`);
  assert(v2.previousVersion === "0.1.0", `previousVersion ${v2.previousVersion}, harus 0.1.0.`);
  log("v0.2.0 diimpor dan diaktifkan (v0.1.0 sebelumnya).");

  await clickButton(page, "Beranda");
  await page.waitFor(`document.body.textContent.includes("Jelajah Materi")`, {
    label: "Beranda"
  });
  await openPlayer(page);
  await page.waitFor(`document.body.textContent.includes("Paket impor v0.2.0")`, {
    label: "badge v0.2.0"
  });
  await page.waitFor(`document.body.textContent.includes("Mengenal Pecahan (E2E v2)")`, {
    label: "judul v0.2.0"
  });
  log("Player menampilkan versi 0.2.0 setelah remount.");

  const rolledBack = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("content_rollback_package", { packageId: "matematika-kelas3-pecahan" })
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
  assert(rolledBack.ok, `Rollback gagal: ${JSON.stringify(rolledBack.error)}`);
  assert(
    rolledBack.value.activeVersion === "0.1.0",
    `Setelah rollback aktif ${rolledBack.value.activeVersion}, harus 0.1.0.`
  );
  log("Rollback mengaktifkan kembali v0.1.0.");

  await clickButton(page, "Beranda");
  await openPlayer(page);
  await page.waitFor(`document.body.textContent.includes("Paket impor v0.1.0")`, {
    label: "badge v0.1.0 setelah rollback"
  });
  await page.waitFor(
    `document.body.textContent.includes("Mengenal Pecahan 1/2, 1/3, dan 1/4")`,
    { label: "judul v0.1.0 setelah rollback" }
  );
  log("Player kembali ke versi 0.1.0.");

  const packages = await page.evaluate(
    `window.__TAURI_INTERNALS__.invoke("content_list_packages")`
  );
  const versions = new Map(
    packages
      .filter((entry) => entry.packageId === "matematika-kelas3-pecahan")
      .map((entry) => [entry.version, entry.status])
  );
  assert(versions.get("0.1.0") === "active", `Status 0.1.0: ${versions.get("0.1.0")}.`);
  assert(versions.get("0.2.0") === "disabled", `Status 0.2.0: ${versions.get("0.2.0")}.`);
  log("Daftar paket: 0.1.0 active, 0.2.0 disabled.");

  await page.screenshot(path.join(artifactDir, "content-rollback.png"));
  log("Screenshot rollback tersimpan.");
}
