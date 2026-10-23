import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function rowExpression(name) {
  return `([...document.querySelectorAll("li")].find((row) => row.textContent.includes(${JSON.stringify(
    name
  )})))`;
}

function clickInRow(name, label) {
  return `
    (() => {
      const row = ${rowExpression(name)};
      if (!row) return "row-missing";
      const button = [...row.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === ${JSON.stringify(label)});
      if (!button) return "button-missing";
      if (button.disabled) return "disabled";
      button.click();
      return "clicked";
    })()
  `;
}

function fillInput(selector, value) {
  return `
    (() => {
      const input = ${selector};
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

async function expectClick(page, result, message) {
  const value = await page.evaluate(result);
  assert(value === "clicked", `${message} (hasil: ${value})`);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const opened = await page.evaluate(`
    (() => {
      const target = [...document.querySelectorAll("button")]
        .find((button) => button.textContent.trim() === "Pengaturan");
      if (!target) return false;
      target.click();
      return true;
    })()
  `);
  assert(opened, "Navigasi Pengaturan tidak ditemukan.");

  await page.waitFor(`document.body.textContent.includes("Siswa Lokal")`, {
    label: "profil default"
  });
  log("Profil default tampil.");

  const lastProfileDisabled = await page.evaluate(`
    (() => {
      const row = ${rowExpression("Siswa Lokal")};
      const button = [...row.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === "Hapus");
      return Boolean(button?.disabled);
    })()
  `);
  assert(lastProfileDisabled, "Tombol Hapus seharusnya nonaktif untuk profil terakhir.");
  log("Profil terakhir tidak dapat dihapus (tombol nonaktif).");

  const filled = await page.evaluate(
    fillInput(`document.querySelector('input[placeholder="Nama siswa atau guru"]')`, "Budi")
  );
  assert(filled, "Input nama profil baru tidak ditemukan.");
  await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === "Tambah profil");
      button.click();
    })()
  `);
  await page.waitFor(`document.body.textContent.includes('Profil "Budi" dibuat')`, {
    label: "profil Budi dibuat"
  });
  log("Profil Budi dibuat dan diaktifkan.");

  await expectClick(page, clickInRow("Budi", "Ubah nama"), "Tombol Ubah nama tidak dapat diklik");
  await page.waitFor(
    `document.querySelector('input[aria-label="Nama baru untuk Budi"]') !== null`,
    { label: "form rename" }
  );
  const renamed = await page.evaluate(
    fillInput(`document.querySelector('input[aria-label="Nama baru untuk Budi"]')`, "Budi Santoso")
  );
  assert(renamed, "Input rename tidak ditemukan.");
  await page.evaluate(`
    (() => {
      const row = ${rowExpression("Budi")};
      const button = [...row.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === "Simpan");
      button.click();
    })()
  `);
  await page.waitFor(`document.body.textContent.includes('diperbarui menjadi "Budi Santoso"')`, {
    label: "rename tersimpan"
  });
  log("Rename Budi → Budi Santoso tersimpan.");

  const filledThird = await page.evaluate(
    fillInput(`document.querySelector('input[placeholder="Nama siswa atau guru"]')`, "Uji Hapus")
  );
  assert(filledThird, "Input profil ketiga tidak ditemukan.");
  await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === "Tambah profil");
      button.click();
    })()
  `);
  await page.waitFor(`document.body.textContent.includes('Profil "Uji Hapus" dibuat')`, {
    label: "profil Uji Hapus dibuat"
  });

  await expectClick(page, clickInRow("Uji Hapus", "Hapus"), "Tombol Hapus tidak dapat diklik");
  await page.waitFor(
    `document.body.textContent.includes('Hapus profil "Uji Hapus"?')`,
    { label: "konfirmasi hapus" }
  );
  await page.evaluate(`
    (() => {
      const row = ${rowExpression("Uji Hapus")};
      const buttons = [...row.querySelectorAll("button")]
        .filter((item) => item.textContent.trim() === "Hapus");
      buttons.at(-1).click();
    })()
  `);
  await page.waitFor(`document.body.textContent.includes('Profil "Uji Hapus" dihapus')`, {
    label: "profil dihapus"
  });
  log("Profil tanpa data dihapus setelah konfirmasi.");

  const result = await page.evaluate(`
    Promise.all([
      window.__TAURI_INTERNALS__.invoke("profile_list"),
      window.__TAURI_INTERNALS__.invoke("profile_get_active")
    ]).then(([profiles, active]) => ({
      names: profiles.map((profile) => profile.displayName).sort(),
      active: active.displayName
    }))
  `);
  assert(result.names.length === 2, `Jumlah profil akhir ${result.names.length}, harus 2.`);
  assert(
    result.names.includes("Budi Santoso") && result.names.includes("Siswa Lokal"),
    `Nama profil tidak sesuai: ${result.names.join(", ")}`
  );
  assert(
    result.active === "Siswa Lokal",
    `Profil aktif setelah hapus: ${result.active}, harus Siswa Lokal.`
  );
  log(`State akhir: ${result.names.join(" · ")}; aktif ${result.active}.`);

  await page.screenshot(path.join(artifactDir, "profile-lifecycle.png"));
  log("Screenshot siklus hidup profil tersimpan.");
}
