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

function fillSearch(value) {
  return `
    (() => {
      const input = document.querySelector('input[aria-label="Cari materi"]');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()
  `;
}

function selectFilter(label, value) {
  return `
    (() => {
      const select = document.querySelector('select[aria-label=${JSON.stringify(label)}]');
      if (!select) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value"
      ).set;
      setter.call(select, ${JSON.stringify(value)});
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()
  `;
}

function clickGrade(value) {
  return `
    (() => {
      const group = document.querySelector('[role="group"][aria-labelledby="filter-kelas-label"]');
      if (!group) return false;
      const target = [...group.querySelectorAll("button")].find(
        (button) => button.textContent.trim() === ${JSON.stringify(`Kelas ${value}`)}
      );
      if (!target) return false;
      target.click();
      return true;
    })()
  `;
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label: "sapaan Beranda"
  });
  await page.waitFor(
    `document.body.textContent.includes("Matematika") && /\\d+ materi/.test(document.body.textContent)`,
    { label: "kartu mata pelajaran di Beranda" }
  );

  const avatarSource = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../..",
    "content/packages/kelas3-matematika-b01-bilangan-10000/assets/nilai-tempat-10000.webp"
  );
  const avatarSet = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("profile_get_active")
      .then((active) =>
        window.__TAURI_INTERNALS__.invoke("profile_avatar_set", {
          profileId: active.id,
          sourcePath: ${JSON.stringify(avatarSource)}
        })
      )
      .then((profile) => ({ ok: true, hasAvatar: profile.hasAvatar }))
      .catch((error) => ({ ok: false, error: String(error) }))
  `);
  assert(
    avatarSet.ok && avatarSet.hasAvatar,
    `Foto profil demo gagal dipasang: ${JSON.stringify(avatarSet.error)}`
  );
  await page.send("Page.reload");
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri setelah muat ulang"
  });
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label: "sapaan Beranda setelah muat ulang",
    timeoutMs: 30_000
  });
  await page.waitFor(
    `(() => {
      const avatar = document.querySelector("img[data-profile-avatar]");
      const illustration = document.querySelector("[data-learning-illustration] img");
      return (
        avatar && avatar.complete && avatar.naturalWidth > 0 &&
        illustration && illustration.complete && illustration.naturalWidth > 0
      );
    })()`,
    { label: "foto profil dan ilustrasi Beranda" }
  );
  log("Beranda menampilkan foto profil dan ilustrasi belajar.");
  await page.screenshot(path.join(artifactDir, "hero-beranda.png"));

  const pilotPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../fixtures/pilot-pecahan-kelas3"
  );
  const imported = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("content_import_package", { input: { sourcePath: ${JSON.stringify(pilotPath)} } })
      .then((result) => ({ ok: true, result }))
      .catch((error) => ({ ok: false, error: String(error) }))
  `);
  assert(imported.ok, `Impor pilot fixture gagal: ${JSON.stringify(imported.error)}`);
  log("Pilot fixture diimpor untuk menguji katalog bawaan + impor.");
  const resumeVisible = await page.evaluate(`
    [...document.querySelectorAll("h2")]
      .some((heading) => heading.textContent.trim() === "Lanjutkan belajar")
  `);
  assert(!resumeVisible, "Beranda tanpa riwayat tidak boleh menampilkan kartu lanjutkan.");
  log("Beranda: sapaan, ringkasan, dan kartu mata pelajaran tampil.");

  await clickButton(page, "Jelajah Materi");
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`,
    { label: "halaman katalog" }
  );
  await page.waitFor(`document.body.textContent.includes("materi ditemukan.")`, {
    label: "jumlah materi"
  });
  log("Katalog memuat materi bawaan + impor.");

  await page.waitFor(
    `[...document.querySelectorAll('[role="group"][aria-labelledby="filter-kelas-label"] img')].filter((img) => img.complete && img.naturalWidth > 0).length >= 6`,
    { label: "thumbnail pilihan kelas" }
  );
  log("Pilihan kelas berupa tile thumbnail dari aset paket.");

  assert(await page.evaluate(fillSearch("fotosintesis")), "Input pencarian tidak ditemukan.");
  await page.waitFor(`document.body.textContent.includes("Tidak ada materi yang cocok")`, {
    label: "hasil pencarian kosong"
  });
  log("Pencarian tanpa hasil menampilkan empty state.");

  assert(await page.evaluate(fillSearch("pecahan")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `document.body.textContent.includes("Pecahan Sederhana") && document.body.textContent.includes("Mengenal Pecahan")`,
    { label: "hasil pencarian pecahan" }
  );
  await page.waitFor(
    `[...document.querySelectorAll('img[data-lesson-thumb]')].filter((img) => img.complete && img.naturalWidth > 0).length >= 2`,
    { label: "thumbnail materi" }
  );
  log("Kartu materi menampilkan thumbnail dari aset paket bawaan dan impor.");
  assert(await page.evaluate(fillSearch("")), "Input pencarian tidak ditemukan.");

  assert(await page.evaluate(clickGrade(3)), "Tile Kelas 3 tidak ditemukan.");
  await page.waitFor(
    `document.querySelector('button[aria-controls="filter-kelas-grid"]')?.textContent.includes("Kelas 3")`,
    { label: "label kelas terpilih" }
  );
  const pickerCollapsed = await page.evaluate(`
    (() => {
      const toggle = document.querySelector('button[aria-controls="filter-kelas-grid"]');
      return (
        toggle?.getAttribute("aria-expanded") === "false" &&
        document.getElementById("filter-kelas-grid") === null
      );
    })()
  `);
  assert(pickerCollapsed, "Panel pilihan kelas tidak menutup setelah kelas dipilih.");
  log("Memilih kelas menutup panel dan menampilkan “Kelas 3” pada header.");
  assert(
    await page.evaluate(selectFilter("Filter mata pelajaran", "matematika")),
    "Filter mata pelajaran tidak ditemukan."
  );
  await page.waitFor(`document.body.textContent.includes("Bilangan sampai 10.000")`, {
    label: "hasil filter"
  });
  await page.waitFor(
    `[...document.querySelectorAll('img[data-lesson-thumb]')].slice(0, 2).every((img) => img.complete && img.naturalWidth > 0)`,
    { label: "thumbnail pada hasil filter" }
  );
  log("Filter kelas 3 + matematika tetap menampilkan materi.");
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot(path.join(artifactDir, "catalog-thumbnails.png"));

  const toggledOpen = await page.evaluate(`
    (() => {
      const toggle = document.querySelector('button[aria-controls="filter-kelas-grid"]');
      if (!toggle) return false;
      toggle.click();
      return true;
    })()
  `);
  assert(toggledOpen, "Header pilihan kelas tidak ditemukan.");
  await page.waitFor(
    `document.querySelector('button[aria-controls="filter-kelas-grid"]')?.getAttribute("aria-expanded") === "true" &&
     document.querySelector('[role="group"][aria-labelledby="filter-kelas-label"]') !== null`,
    { label: "panel pilihan kelas terbuka kembali" }
  );
  log("Header pilihan kelas bisa dibuka kembali (collapsible).");

  const clickedPilot = await page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")].filter(
        (button) => button.textContent.trim() === "Buka materi"
      );
      const target = buttons.find((button) => {
        let node = button;
        for (let depth = 0; depth < 6 && node; depth += 1, node = node.parentElement) {
          if (node.textContent.includes("Mengenal Pecahan 1/2")) return true;
        }
        return false;
      });
      if (!target) return "missing";
      target.click();
      return "clicked";
    })()
  `);
  assert(clickedPilot === "clicked", `Tombol Buka materi pilot tidak ditemukan (${clickedPilot}).`);
  await page.waitFor(`document.body.textContent.includes("Tujuan pembelajaran")`, {
    label: "Player dibuka"
  });
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Mengenal Pecahan")`,
    { label: "judul lesson di Player" }
  );
  await page.waitFor(`document.body.textContent.includes("Paket impor v0.1.0")`, {
    label: "sumber paket impor"
  });
  log("Buka materi membuka lesson yang dipilih di Player.");

  await clickButton(page, "Lanjut");
  await clickButton(page, "Lanjut");
  await clickButton(page, "Lanjut");
  await page.waitFor(`document.body.textContent.includes("Langkah 4 dari 4")`, {
    label: "eksplorasi langkah 4"
  });
  await clickButton(page, "Selesai");
  await clickButton(page, "Lanjut berlatih");
  await page.waitFor(`document.body.textContent.includes("Periksa jawaban")`, {
    label: "kuis tampil"
  });
  for (const optionId of ["opsi-setengah", "opsi-1-4", "opsi-besar", "opsi-2-3"]) {
    const chosen = await page.evaluate(`
      (() => {
        const input = document.querySelector('input[value="${optionId}"]');
        if (!input) return false;
        input.click();
        return input.checked;
      })()
    `);
    assert(chosen, `Opsi ${optionId} tidak dapat dipilih.`);
  }
  await clickButton(page, "Periksa jawaban");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor kuis"
  });
  await page.waitFor(`document.body.textContent.includes("Tersimpan lokal")`, {
    label: "hasil tersimpan",
    timeoutMs: 30_000
  });
  log("Kuis selesai dan tersimpan lokal.");

  await clickButton(page, "Beranda");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label: "kembali ke Beranda"
  });
  await page.waitFor(
    `[...document.querySelectorAll("h2")].some((heading) => heading.textContent.trim() === "Lanjutkan belajar")`,
    { label: "kartu lanjutkan belajar" }
  );
  await page.waitFor(
    `document.body.textContent.includes("Mengenal Pecahan 1/2, 1/3, dan 1/4")`,
    { label: "judul lesson pada kartu lanjutkan" }
  );
  await clickButton(page, "Lanjutkan");
  await page.waitFor(`document.body.textContent.includes("Tujuan pembelajaran")`, {
    label: "Player dibuka dari kartu lanjutkan"
  });
  log("Kartu “Lanjutkan belajar” muncul dan membuka lesson terakhir.");

  await page.screenshot(path.join(artifactDir, "home-catalog.png"));
  log("Screenshot Beranda/katalog tersimpan.");
}
