import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function clickModeButton(page, label) {
  const result = await page.evaluate(`
    (() => {
      const target = [...document.querySelectorAll('[aria-label="Mode aplikasi"] button')]
        .find((button) => button.textContent.trim() === ${JSON.stringify(label)});
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  if (result !== "clicked") {
    throw new Error(`Tombol mode "${label}" tidak dapat diklik (${result}).`);
  }
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  await page.waitFor(`document.body.textContent.includes("Jelajah Materi")`, {
    label: "shell aplikasi"
  });

  const adminView = await page.evaluate(`
    ({
      sidebar: Boolean(document.querySelector("aside")),
      mainWidth: document.querySelector("main")?.getBoundingClientRect().width ?? 0,
      viewport: document.documentElement.clientWidth,
      modePressed: [...document.querySelectorAll('[aria-label="Mode aplikasi"] button')]
        .map((button) => ({ label: button.textContent.trim(), pressed: button.getAttribute("aria-pressed") }))
    })
  `);
  assert(adminView.sidebar, "Mode admin harus menampilkan sidebar saat aplikasi dibuka.");
  const adminPressed = adminView.modePressed.find((entry) => entry.label === "Admin");
  assert(adminPressed?.pressed === "true", "Tombol mode Admin harus aktif saat aplikasi dibuka.");
  log(`Mode admin tampil dengan sidebar (lebar konten ${Math.round(adminView.mainWidth)} px).`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot(path.join(artifactDir, "mode-admin.png"));

  await clickModeButton(page, "Belajar");
  await page.waitFor(`!document.querySelector("aside")`, { label: "sidebar tersembunyi" });
  await page.waitFor(
    `document.querySelector('nav[aria-label="Navigasi belajar"]') !== null`,
    { label: "navigasi belajar" }
  );

  const studentView = await page.evaluate(`
    ({
      sidebar: Boolean(document.querySelector("aside")),
      mainWidth: document.querySelector("main")?.getBoundingClientRect().width ?? 0,
      viewport: document.documentElement.clientWidth,
      navLabels: [...document.querySelectorAll('nav[aria-label="Navigasi belajar"] button')]
        .map((button) => button.textContent.trim()),
      adminLabels: ["Konten & Pembaruan", "Lisensi Perangkat", "Pengaturan"].filter((label) =>
        [...document.querySelectorAll("button")].some((button) => button.textContent.trim() === label)
      )
    })
  `);
  assert(!studentView.sidebar, "Mode belajar tidak boleh menampilkan sidebar.");
  assert(
    studentView.mainWidth >= studentView.viewport - 1,
    `Konten mode belajar harus selebar perangkat (${studentView.mainWidth} vs ${studentView.viewport}).`
  );
  assert(
    studentView.mainWidth > adminView.mainWidth + 200,
    "Konten mode belajar harus lebih lebar daripada mode admin."
  );
  assert(
    JSON.stringify(studentView.navLabels) ===
      JSON.stringify(["Beranda", "Jelajah Materi", "Aktivitas Interaktif", "Hasil Belajar"]),
    `Navigasi belajar tidak sesuai: ${studentView.navLabels.join(", ")}`
  );
  assert(
    studentView.adminLabels.length === 0,
    `Layar kelola masih tampil di mode belajar: ${studentView.adminLabels.join(", ")}`
  );
  log(
    `Mode belajar tanpa sidebar; konten ${Math.round(studentView.mainWidth)} px dan ${studentView.navLabels.length} tujuan belajar.`
  );
  await page.evaluate(`document.querySelector("main")?.scrollTo(0, 0)`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot(path.join(artifactDir, "mode-belajar.png"));

  await page.waitFor(
    `window.__TAURI_INTERNALS__.invoke("preferences_get").then((prefs) => prefs.appMode === "belajar")`,
    { label: "mode belajar tersimpan" }
  );
  log("Mode belajar tersimpan di preferensi perangkat.");

  await page.evaluate(`
    (() => {
      const target = [...document.querySelectorAll('nav[aria-label="Navigasi belajar"] button')]
        .find((button) => button.textContent.trim() === "Hasil Belajar");
      target?.click();
    })()
  `);
  await page.waitFor(`document.body.textContent.includes("Aktivitas terbaru")`, {
    label: "layar Hasil Belajar"
  });
  await page.waitFor(`window.location.hash === "#results"`, { label: "hash hasil" });
  log("Navigasi belajar dari bar horizontal membuka Hasil Belajar.");

  await clickModeButton(page, "Admin");
  await page.waitFor(`document.querySelector("aside") !== null`, {
    label: "sidebar kembali"
  });
  await page.waitFor(
    `window.__TAURI_INTERNALS__.invoke("preferences_get").then((prefs) => prefs.appMode === "admin")`,
    { label: "mode admin tersimpan" }
  );
  log("Kembali ke mode admin mengembalikan sidebar dan tersimpan.");
}
