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

async function openMaterial(page, titleFragment) {
  return page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")].filter(
        (button) => button.textContent.trim() === "Buka materi"
      );
      const target = buttons.find((button) => {
        const title = button.closest("li")?.querySelector("h2")?.textContent?.trim() ?? "";
        return title.includes(${JSON.stringify(titleFragment)});
      });
      if (!target) return { status: "missing" };
      const title = target.closest("li")?.querySelector("h2")?.textContent?.trim() ?? null;
      target.click();
      return { status: "clicked", title };
    })()
  `);
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

function clickSubject(label) {
  return `
    (() => {
      const group = document.querySelector('[role="group"][aria-labelledby="filter-mapel-label"]');
      if (!group) return false;
      const target = [...group.querySelectorAll("button")].find(
        (button) => button.textContent.trim() === ${JSON.stringify(label)}
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
        window.__TAURI_INTERNALS__
          .invoke("profile_avatar_preview", { sourcePath: ${JSON.stringify(avatarSource)} })
          .then((dataUrl) => {
            if (!dataUrl.startsWith("data:image/")) {
              throw new Error("pratinjau bukan data URL gambar");
            }
            return window.__TAURI_INTERNALS__.invoke("profile_avatar_set_data", {
              profileId: active.id,
              dataUrl
            });
          })
      )
      .then((profile) => ({ ok: true, hasAvatar: profile.hasAvatar }))
      .catch((error) => ({ ok: false, error: String(error) }))
  `);
  assert(
    avatarSet.ok && avatarSet.hasAvatar,
    `Foto profil demo gagal dipasang: ${JSON.stringify(avatarSet.error)}`
  );
  log("Pratinjau sumber foto dan penyimpanan avatar data URL berfungsi.");
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
        illustration && illustration.complete && illustration.naturalWidth > 0 &&
        illustration.src.includes("cover-mapel-")
      );
    })()`,
    { label: "foto profil dan ilustrasi Beranda" }
  );
  log("Beranda menampilkan foto profil dan ilustrasi dari cover mapel khusus.");

  await page.waitFor(
    `(() => {
      const cards = [...document.querySelectorAll("[data-subject-card]")];
      return (
        cards.length >= 5 &&
        cards.every((card) => {
          const img = card.querySelector("img[data-cover-art]");
          return (
            img && img.complete && img.naturalWidth > 0 && img.src.includes("cover-mapel-")
          );
        })
      );
    })()`,
    { label: "cover mata pelajaran Beranda" }
  );
  const subjectCardCount = await page.evaluate(
    `document.querySelectorAll("[data-subject-card]").length`
  );
  log(`Kartu materi Beranda (${subjectCardCount}) memakai cover mapel khusus.`);
  await new Promise((resolve) => setTimeout(resolve, 500));
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

  // Regresi T-086: kartu mapel harus membuka katalog yang sudah terfilter mapel itu.
  const subjectClick = await page.evaluate(`
    (() => {
      const card = [...document.querySelectorAll("[data-subject-card]")]
        .find((node) => node.textContent.includes("Matematika"));
      if (!card) return "missing";
      const button = card.querySelector("button");
      if (!button) return "no-button";
      button.click();
      return "clicked";
    })()
  `);
  assert(subjectClick === "clicked", `Kartu mapel Matematika tidak dapat diklik (${subjectClick}).`);
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`,
    { label: "katalog dibuka dari kartu mapel" }
  );
  await page.waitFor(
    `(() => {
      const cards = [...document.querySelectorAll("[data-catalog-subjects]")];
      const chip = document.querySelector('button[aria-controls="filter-mapel-grid"]');
      return (
        cards.length > 0 &&
        cards.every((card) => card.dataset.catalogSubjects.split(",").includes("matematika")) &&
        Boolean(chip && chip.textContent.includes("Matematika"))
      );
    })()`,
    { label: "kartu katalog terfilter matematika" }
  );
  const mathCount = await page.evaluate(
    `document.querySelectorAll("[data-catalog-subjects]").length`
  );
  log(`Kartu mapel Beranda membuka katalog terfilter Matematika (${mathCount} kartu, semua matematika).`);

  const arrival = await page.evaluate(`(() => {
    const scroller = document.scrollingElement ?? document.documentElement;
    const subjectToggle = document.querySelector('button[aria-controls="filter-mapel-grid"]');
    const subjectGrid = document.getElementById("filter-mapel-grid");
    const classGrid = document.getElementById("filter-kelas-grid");
    return {
      scrollTop: scroller.scrollTop,
      subjectCollapsed: subjectToggle?.getAttribute("aria-expanded") === "false" && !subjectGrid,
      classOpen: Boolean(classGrid),
      classToggle: document.querySelector('button[aria-controls="filter-kelas-grid"]')?.textContent.trim()
    };
  })()`);
  assert(
    arrival.scrollTop === 0,
    `Katalog terbuka pada posisi gulir ${arrival.scrollTop}, seharusnya 0.`
  );
  assert(
    arrival.subjectCollapsed && arrival.classOpen,
    `Setelah memilih mapel, grid mapel harus terlipat dan grid kelas terbuka (${JSON.stringify(arrival)}).`
  );
  log(
    `Katalog terbuka di posisi atas, grid mapel terlipat, dan pilihan kelas langsung tersedia (${arrival.classToggle}).`
  );
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot(path.join(artifactDir, "katalog-dari-mapel.png"));

  await clickButton(page, "Kelas 3");
  await page.waitFor(
    `(() => {
      const cards = [...document.querySelectorAll("[data-catalog-subjects]")];
      const chips = [...document.querySelectorAll("main span")].map((node) => node.textContent.trim());
      return (
        cards.length > 0 &&
        cards.every(
          (card) =>
            card.dataset.catalogSubjects.split(",").includes("matematika") &&
            card.dataset.catalogGrades.split(",").every((grade) => grade === "3")
        ) &&
        chips.includes("Kelas 3") &&
        chips.includes("Matematika")
      );
    })()`,
    { label: "katalog terfilter matematika kelas 3" }
  );
  const classCount = await page.evaluate(
    `document.querySelectorAll("[data-catalog-subjects]").length`
  );
  assert(classCount < mathCount, `Filter kelas tidak mempersempit hasil (${classCount} vs ${mathCount}).`);
  log(`Pilih kelas setelah mapel: ${classCount} kartu matematika kelas 3 (dari ${mathCount}).`);
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot(path.join(artifactDir, "katalog-matematika-kelas3.png"));

  await clickButton(page, "Beranda");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label: "Beranda setelah katalog terfilter"
  });
  log("Permintaan filter tidak menempel: kembali ke Beranda lalu buka katalog lagi tanpa filter.");

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
    `[...document.querySelectorAll('[role="group"][aria-labelledby="filter-kelas-label"] img[data-cover-art]')].filter((img) => img.complete && img.naturalWidth > 0 && img.src.includes("cover-kelas-")).length >= 6`,
    { label: "thumbnail pilihan kelas" }
  );
  log("Pilihan kelas memakai 6 cover kelas khusus (16:9).");
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot(path.join(artifactDir, "filter-kelas.png"));

  assert(await page.evaluate(fillSearch("fotosintesis")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `document.querySelector("[data-catalog-empty]")?.textContent.includes("kata kunci “fotosintesis”")`,
    { label: "hasil pencarian kosong" }
  );
  log("Pencarian tanpa hasil menampilkan empty state yang menyebut kata kunci.");

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

  assert(await page.evaluate(fillSearch("ipas")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `(() => {
      const cards = [...document.querySelectorAll("[data-catalog-subjects]")];
      return (
        cards.length > 0 &&
        cards.every((card) => card.dataset.catalogSubjects.split(",").includes("ipas"))
      );
    })()`,
    { label: "hasil pencarian ipas" }
  );
  const ipasCount = await page.evaluate(
    `document.querySelectorAll("[data-catalog-subjects]").length`
  );
  log(`Pencarian kata "ipas" menemukan ${ipasCount} materi IPAS tanpa filter.`);
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
  await page.waitFor(
    `[...document.querySelectorAll('#filter-mapel-grid img[data-cover-art]')].length >= 7 &&
     [...document.querySelectorAll('#filter-mapel-grid img[data-cover-art]')].every((img) => img.complete && img.naturalWidth > 0 && img.src.includes("cover-mapel-"))`,
    { label: "thumbnail pilihan mata pelajaran" }
  );
  const subjectTileCount = await page.evaluate(
    `document.querySelectorAll('#filter-mapel-grid button').length`
  );
  log(`Pilihan mata pelajaran memakai ${subjectTileCount - 1} cover mapel khusus.`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot(path.join(artifactDir, "filter-mapel.png"));
  assert(
    await page.evaluate(clickSubject("Matematika")),
    "Tile mata pelajaran Matematika tidak ditemukan."
  );
  await page.waitFor(
    `document.querySelector('button[aria-controls="filter-mapel-grid"]')?.textContent.includes("Matematika")`,
    { label: "chip mata pelajaran terpilih" }
  );
  const subjectPickerCollapsed = await page.evaluate(`
    (() => {
      const toggle = document.querySelector('button[aria-controls="filter-mapel-grid"]');
      return (
        toggle?.getAttribute("aria-expanded") === "false" &&
        document.getElementById("filter-mapel-grid") === null
      );
    })()
  `);
  assert(
    subjectPickerCollapsed,
    "Panel pilihan mata pelajaran tidak menutup setelah mata pelajaran dipilih."
  );
  log("Memilih mata pelajaran menutup panel dan menampilkan “Matematika” pada header.");
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

  // Regresi T-088: mengetik "ipas" saat chip mapel masih Matematika tidak boleh
  // tampil sebagai "tidak ada" tanpa penjelasan.
  assert(await page.evaluate(fillSearch("ipas")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `(() => {
      const empty = document.querySelector("[data-catalog-empty]");
      if (!empty) return false;
      const text = empty.textContent;
      return (
        text.includes("kata kunci “ipas”") &&
        text.includes("Matematika") &&
        text.includes("kelas 3") &&
        text.includes("Cari di semua mapel")
      );
    })()`,
    { label: "empty state menjelaskan filter mapel aktif" }
  );
  log(
    "Pencarian “ipas” di filter Matematika + Kelas 3 menjelaskan filter aktif dan menawarkan “Cari di semua mapel”."
  );
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot(path.join(artifactDir, "katalog-ipas-filter-aktif.png"));

  await clickButton(page, "Cari di semua mapel");
  await page.waitFor(
    `(() => {
      const cards = [...document.querySelectorAll("[data-catalog-subjects]")];
      return (
        cards.length > 0 &&
        cards.every(
          (card) =>
            card.dataset.catalogSubjects.split(",").includes("ipas") &&
            card.dataset.catalogGrades.split(",").every((grade) => grade === "3")
        )
      );
    })()`,
    { label: "hasil ipas setelah melepas filter mapel" }
  );
  const ipasKelas3 = await page.evaluate(
    `document.querySelectorAll("[data-catalog-subjects]").length`
  );
  log(`“Cari di semua mapel” menampilkan ${ipasKelas3} materi IPAS kelas 3.`);
  assert(await page.evaluate(fillSearch("")), "Input pencarian tidak ditemukan.");

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

  const openedPilot = await openMaterial(page, "Mengenal Pecahan 1/2");
  assert(openedPilot.status === "clicked", `Tombol Buka materi pilot tidak ditemukan (${openedPilot.status}).`);
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

  // Regresi T-084: materi dari paket lain harus tampil, bukan jatuh ke paket pertama.
  await clickButton(page, "Jelajah Materi");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`, {
    label: "kembali ke katalog"
  });
  await page.waitFor(
    `document.body.textContent.includes("materi ditemukan.") &&
     [...document.querySelectorAll("button")].filter((button) => button.textContent.trim() === "Buka materi").length > 100`,
    { label: "kartu katalog kembali penuh" }
  );
  const openedOther = await openMaterial(page, "Zakat dan Infak");
  assert(
    openedOther.status === "clicked" && openedOther.title,
    `Tombol Buka materi paket lain tidak ditemukan (${openedOther.status}).`
  );
  await page.waitFor(`document.body.textContent.includes("Tujuan pembelajaran")`, {
    label: "Player dibuka untuk paket lain"
  });
  await page.waitFor(`document.querySelector("main h1")?.textContent.trim() === ${JSON.stringify(openedOther.title)}`, {
    label: `judul "${openedOther.title}" di Player`
  });
  log(`Materi kedua “${openedOther.title}” tampil sesuai pilihan, bukan paket pertama.`);

  await clickButton(page, "Jelajah Materi");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`, {
    label: "kembali ke katalog"
  });
  await page.waitFor(
    `document.body.textContent.includes("materi ditemukan.") &&
     [...document.querySelectorAll("button")].filter((button) => button.textContent.trim() === "Buka materi").length > 100`,
    { label: "kartu katalog kembali penuh" }
  );
  const reopenedPilot = await openMaterial(page, "Mengenal Pecahan 1/2");
  assert(
    reopenedPilot.status === "clicked",
    `Tombol Buka materi pilot tidak ditemukan saat dibuka ulang (${reopenedPilot.status}).`
  );
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Mengenal Pecahan")`,
    { label: "judul pilot saat dibuka ulang" }
  );
  await page.waitFor(`document.body.textContent.includes("Paket impor v0.1.0")`, {
    label: "sumber paket impor saat dibuka ulang"
  });

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
