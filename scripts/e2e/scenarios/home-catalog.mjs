import path from "node:path";

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

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label: "sapaan Beranda"
  });
  await page.waitFor(
    `document.body.textContent.includes("Matematika") && document.body.textContent.includes("1 materi")`,
    { label: "kartu mata pelajaran di Beranda" }
  );
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
  await page.waitFor(`document.body.textContent.includes("1 materi ditemukan")`, {
    label: "jumlah materi"
  });
  log("Katalog memuat 1 materi bawaan.");

  assert(await page.evaluate(fillSearch("wujud")), "Input pencarian tidak ditemukan.");
  await page.waitFor(`document.body.textContent.includes("Tidak ada materi yang cocok")`, {
    label: "hasil pencarian kosong"
  });
  log("Pencarian tanpa hasil menampilkan empty state.");

  assert(await page.evaluate(fillSearch("pecahan")), "Input pencarian tidak ditemukan.");
  await page.waitFor(`document.body.textContent.includes("1 materi ditemukan")`, {
    label: "hasil pencarian pecahan"
  });
  assert(await page.evaluate(fillSearch("")), "Input pencarian tidak ditemukan.");

  assert(await page.evaluate(selectFilter("Filter kelas", "3")), "Filter kelas tidak ditemukan.");
  assert(
    await page.evaluate(selectFilter("Filter mata pelajaran", "matematika")),
    "Filter mata pelajaran tidak ditemukan."
  );
  await page.waitFor(`document.body.textContent.includes("1 materi ditemukan")`, {
    label: "hasil filter"
  });
  log("Filter kelas 3 + matematika tetap menampilkan materi.");

  await clickButton(page, "Buka materi");
  await page.waitFor(`document.body.textContent.includes("Tujuan pembelajaran")`, {
    label: "Player dibuka"
  });
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Mengenal Pecahan")`,
    { label: "judul lesson di Player" }
  );
  await page.waitFor(`document.body.textContent.includes("Paket bawaan build")`, {
    label: "sumber paket bawaan"
  });
  log("Buka materi membuka lesson yang dipilih di Player.");

  await clickButton(page, "Lanjut");
  await clickButton(page, "Lanjut");
  await clickButton(page, "Lanjut");
  await page.waitFor(`document.body.textContent.includes("Langkah 4 dari 4")`, {
    label: "eksplorasi langkah 4"
  });
  await clickButton(page, "Selesai");
  await clickButton(page, "Lanjut ke kuis");
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
