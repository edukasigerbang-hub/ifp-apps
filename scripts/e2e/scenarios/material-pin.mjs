import path from "node:path";
import { setup as importSetup } from "./material-import.mjs";

export const setup = importSetup;

const MATERIAL_ID = "siklus-air-uji";

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

async function pressEscape(page) {
  await page.evaluate(`document.querySelector("[data-material-viewer]")?.focus()`);
  const key = {
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27
  };
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", ...key });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
}

async function waitForHome(page, label) {
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label,
    timeoutMs: 30_000
  });
}

const pinState = `(() => {
  const button = document.querySelector('[data-material-pin="${MATERIAL_ID}"]');
  if (!button) return { result: "missing" };
  return {
    result: "found",
    pressed: button.getAttribute("aria-pressed"),
    text: button.textContent.trim(),
    disabled: button.disabled
  };
})()`.replace("${MATERIAL_ID}", MATERIAL_ID);

const materialCardState = `(() => {
  const card = document.querySelector('[data-pinned-material="${MATERIAL_ID}"]');
  const title = card?.querySelector("[data-pinned-title]")?.textContent.trim() ?? null;
  return {
    count: document.querySelectorAll("[data-pinned-card]").length,
    title,
    text: card?.textContent ?? "",
    hasEmpty: Boolean(document.querySelector("[data-pinned-empty]")),
    openVisible: Boolean(
      card?.querySelector('[data-pinned-material-open="${MATERIAL_ID}"]')?.offsetParent
    )
  };
})()`.replaceAll("${MATERIAL_ID}", MATERIAL_ID);

export async function run({ page, artifactDir, setup, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri"
  });
  await waitForHome(page, "sapaan Beranda");

  const installed = await invoke(page, "material_install_bundle", {
    input: { bundlePath: setup.goodBundle }
  });
  assert(installed.ok, `Instalasi bundel sah gagal: ${JSON.stringify(installed.error)}`);
  log(`Bundel uji terpasang: ${installed.value.title} v${installed.value.version}.`);

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(`document.querySelector('[data-material-pin="${MATERIAL_ID}"]') !== null`, {
    label: "tombol sematkan materi terpasang"
  });
  const before = await page.evaluate(pinState);
  assert(before.result === "found", "Tombol sematkan materi tidak ditemukan.");
  assert(
    before.pressed === "false" && before.text === "Sematkan" && !before.disabled,
    `Keadaan awal tombol sematkan tidak sesuai (${JSON.stringify(before)}).`
  );
  log("Daftar materi terpasang menampilkan tombol Sematkan (aria-pressed=false).");

  const toggle = await page.evaluate(`(() => {
    const button = document.querySelector('[data-material-pin="${MATERIAL_ID}"]');
    if (!button) return "missing";
    if (button.disabled) return "disabled";
    button.click();
    return "clicked";
  })()`);
  assert(toggle === "clicked", `Tombol Sematkan materi tidak dapat diklik (${toggle}).`);
  await page.waitFor(
    `(() => {
      const button = document.querySelector('[data-material-pin="${MATERIAL_ID}"]');
      return button?.getAttribute("aria-pressed") === "true" &&
        button.textContent.trim() === "Disematkan" &&
        document.body.textContent.includes("disematkan ke Beranda");
    })()`,
    { label: "status Disematkan pada materi terpasang" }
  );
  log("Materi HTML5 tersemat: tombol berubah menjadi Disematkan (aria-pressed=true).");

  const pinned = await invoke(page, "pinned_material_list", { profileId: await activeProfileId(page) });
  assert(
    pinned.ok &&
      Array.isArray(pinned.value) &&
      pinned.value.length === 1 &&
      pinned.value[0].materialId === MATERIAL_ID,
    `pinned_material_list tidak sesuai: ${JSON.stringify(pinned)}`
  );
  log("Sematan materi tersimpan di SQLite (pinned_material_list berisi 1 materi).");

  await page.screenshot(path.join(artifactDir, "konten-sematkan-materi.png"));
  log("Screenshot tombol sematkan materi tersimpan.");

  await page.send("Page.reload");
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri setelah muat ulang"
  });
  // Muat ulang memulihkan rute terakhir (Konten & Pembaruan), jadi Beranda dibuka manual.
  await page.waitFor(`document.body.textContent.includes("Konten & Pembaruan")`, {
    label: "shell aplikasi setelah muat ulang",
    timeoutMs: 30_000
  });
  await clickButton(page, "Beranda");
  await waitForHome(page, "Beranda setelah muat ulang");
  await page.waitFor(
    `document.querySelector('[data-home-tab="pinned"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-pinned")?.hidden === false &&
     document.querySelector('[data-pinned-material="${MATERIAL_ID}"]') !== null`,
    { label: "tab Materi disematkan dengan kartu materi" }
  );
  log("Setelah muat ulang Beranda membuka tab Materi disematkan berisi kartu materi HTML5.");

  const card = await page.evaluate(materialCardState);
  assert(card.count === 1, `Tab sematan harus berisi 1 kartu, ditemukan ${card.count}.`);
  assert(
    card.title === "Siklus Air dalam Animasi",
    `Judul kartu sematan "${card.title}" tidak sesuai.`
  );
  assert(card.text.includes("Materi HTML5"), "Kartu materi harus berlabel Materi HTML5.");
  assert(card.text.includes("5 menit"), "Kartu materi harus menampilkan estimasi menit.");
  assert(card.openVisible, "Tombol buka kartu materi tidak terlihat.");
  assert(!card.hasEmpty, "Empty state sematan masih tampil padahal ada sematan.");
  log("Kartu sematan materi menampilkan label Materi HTML5, judul, kelas/menit, dan tombol Buka.");
  await page.screenshot(path.join(artifactDir, "beranda-sematkan-materi.png"));
  log("Screenshot tab Materi disematkan berisi materi HTML5 tersimpan.");

  const open = await page.evaluate(`(() => {
    const button = document.querySelector('[data-pinned-material-open="${MATERIAL_ID}"]');
    if (!button) return "missing";
    if (button.disabled) return "disabled";
    button.click();
    return "clicked";
  })()`);
  assert(open === "clicked", `Tombol Buka pada kartu materi gagal (${open}).`);
  await page.waitFor(`document.querySelector("[data-material-viewer]") !== null`, {
    label: "penampil materi dari Beranda terbuka"
  });
  await page.waitFor(`document.querySelector("[data-material-status='siap']") !== null`, {
    label: "materi siap dari Beranda",
    timeoutMs: 25_000
  });
  const viewerText = await page.evaluate(
    `document.querySelector("[data-material-viewer]")?.textContent ?? ""`
  );
  assert(
    viewerText.includes("Siklus Air dalam Animasi"),
    "Penampil dari Beranda tidak menampilkan judul materi."
  );
  log("Kartu sematan di Beranda membuka penampil materi sampai status siap.");
  await page.screenshot(path.join(artifactDir, "beranda-materi-terbuka.png"));
  await pressEscape(page);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil tertutup"
  });

  const unpin = await page.evaluate(`(() => {
    const card = document.querySelector('[data-pinned-material="${MATERIAL_ID}"]');
    const button = card && [...card.querySelectorAll("button")].find(
      (node) => node.textContent.trim() === "Lepas"
    );
    if (!button) return "missing";
    if (button.disabled) return "disabled";
    button.click();
    return "clicked";
  })()`);
  assert(unpin === "clicked", `Tombol Lepas pada kartu materi gagal (${unpin}).`);
  await page.waitFor(
    `document.querySelector('[data-pinned-material="${MATERIAL_ID}"]') === null &&
     document.querySelector('[data-home-tab="available"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-available")?.hidden === false`,
    { label: "Beranda kembali ke Materi tersedia setelah sematan materi dilepas" }
  );
  const afterList = await invoke(page, "pinned_material_list", {
    profileId: await activeProfileId(page)
  });
  assert(
    afterList.ok && Array.isArray(afterList.value) && afterList.value.length === 0,
    `Sematan materi harus kosong setelah dilepas: ${JSON.stringify(afterList)}`
  );
  log("Lepas sematan materi: kartu hilang, Beranda pindah ke Materi tersedia, SQLite bersih.");

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(`document.querySelector('[data-material-pin="${MATERIAL_ID}"]') !== null`, {
    label: "daftar materi setelah lepas sematan"
  });
  const after = await page.evaluate(pinState);
  assert(
    after.pressed === "false" && after.text === "Sematkan",
    `Tombol sematkan harus kembali ke Sematkan (${JSON.stringify(after)}).`
  );
  log("Daftar materi terpasang membaca ulang status sematan (Sematkan kembali).");

  const notInstalled = await invoke(page, "pinned_material_set", {
    input: {
      profileId: await activeProfileId(page),
      materialId: "materi-tidak-ada",
      pinned: true
    }
  });
  assert(
    !notInstalled.ok && notInstalled.error?.code === "MATERIAL_NOT_FOUND",
    `Sematan materi tak terpasang harus ditolak: ${JSON.stringify(notInstalled)}`
  );
  log("Menyematkan materi yang belum terpasang ditolak (MATERIAL_NOT_FOUND).");
}

async function activeProfileId(page) {
  const profile = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("profile_get_active")
  `);
  assert(profile?.id, "Profil aktif tidak terbaca.");
  return profile.id;
}
