import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  log("Bridge Tauri tersedia di WebView.");

  await page.waitFor(`document.body.innerText.includes("Beranda")`, {
    label: "layar Beranda"
  });
  log("Layar Beranda tampil.");

  const clicked = await page.evaluate(`
    (() => {
      const target = [...document.querySelectorAll("button")]
        .find((button) => button.textContent.trim() === "Pengaturan");
      if (!target) return false;
      target.click();
      return true;
    })()
  `);
  assert(clicked, "Tombol navigasi Pengaturan tidak ditemukan.");

  await page.waitFor(
    `document.body.innerText.toLowerCase().includes("sinkronisasi hasil belajar")`,
    { label: "layar Pengaturan" }
  );
  log("Navigasi ke Pengaturan berhasil.");

  await page.waitFor(`document.body.textContent.includes("Siswa Lokal")`, {
    label: "kartu profil default"
  });
  log("Kartu profil default tampil di UI.");

  const profileCount = await page.evaluate(
    `window.__TAURI_INTERNALS__.invoke("profile_list").then((rows) => rows.length)`
  );
  assert(
    typeof profileCount === "number" && profileCount >= 1,
    `Daftar profil kosong (hasil: ${profileCount}).`
  );
  log(`Profil lokal terbaca (${profileCount} profil).`);

  const active = await page.evaluate(
    `window.__TAURI_INTERNALS__.invoke("profile_get_active").then((row) => row.displayName)`
  );
  assert(
    typeof active === "string" && active.length > 0,
    "Profil aktif tidak dapat dibaca."
  );
  log(`Profil aktif: ${active}.`);

  await page.waitFor(`document.body.textContent.includes("Privasi & data")`, {
    label: "bagian privasi"
  });
  await page.waitFor(`document.body.textContent.includes("disimpan sampai dihapus eksplisit")`, {
    label: "default retensi"
  });
  log("Bagian privasi & data menampilkan default retensi.");

  const mainLandmarks = await page.evaluate(`document.querySelectorAll("main").length`);
  assert(mainLandmarks === 1, `Landmark <main> harus tepat 1, ditemukan ${mainLandmarks}.`);

  await page.screenshot(path.join(artifactDir, "settings.png"));
  log("Screenshot Pengaturan tersimpan.");
}
