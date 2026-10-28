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

const homeTabs = `(() => {
  const tabs = [...document.querySelectorAll("[data-home-tab]")];
  return {
    count: tabs.length,
    labels: tabs.map((tab) => tab.textContent.trim()),
    selected: tabs
      .filter((tab) => tab.getAttribute("aria-selected") === "true")
      .map((tab) => tab.dataset.homeTab),
    tabIndexes: tabs.map((tab) => tab.tabIndex),
    panelsResolve: tabs.every((tab) => {
      const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
      return Boolean(panel) && panel.getAttribute("role") === "tabpanel";
    }),
    visiblePanels: ["pinned", "available", "explore"].filter((id) => {
      const panel = document.getElementById("home-panel-" + id);
      return Boolean(panel) && !panel.hidden && panel.getBoundingClientRect().height > 1;
    })
  };
})()`;

const homePanels = `(() => {
  const panel = (id) => document.getElementById("home-panel-" + id);
  return {
    pinnedHidden: panel("pinned")?.hidden,
    availableHidden: panel("available")?.hidden,
    exploreHidden: panel("explore")?.hidden,
    pinnedCards: document.querySelectorAll("[data-pinned-card]").length,
    subjectCards: document.querySelectorAll("[data-subject-card]").length,
    pinnedEmpty:
      panel("pinned")?.querySelector("[data-pinned-empty]")?.textContent.trim() ?? null
  };
})()`;

const selectTab = (id) => `(() => {
  const tab = document.querySelector('[data-home-tab="${id}"]');
  if (!tab) return "missing";
  tab.click();
  return "clicked";
})()`;

async function pressKey(page, key, code) {
  const params = {
    key,
    code: key,
    windowsVirtualKeyCode: code,
    nativeVirtualKeyCode: code
  };
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", ...params });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...params });
}

const zakatPinToggle = `(() => {
  const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
    (node) => node.getAttribute("aria-label") === "Sematkan Zakat dan Infak"
  );
  if (!button) return "missing";
  if (button.disabled) return "disabled";
  button.click();
  return "clicked";
})()`;

const zakatCardPinState = `(() => {
  const card = [...document.querySelectorAll("main li")].find((node) =>
    node.querySelector("h2")?.textContent.includes("Zakat dan Infak")
  );
  const button = card?.querySelector("[data-pin-toggle]");
  if (!button) return "missing";
  return {
    pressed: button.getAttribute("aria-pressed"),
    label: button.textContent.trim()
  };
})()`;

const homePinnedState = `(() => {
  const card = document.querySelector("[data-pinned-card]");
  return {
    count: document.querySelectorAll("[data-pinned-card]").length,
    title: card?.querySelector("[data-pinned-title]")?.textContent.trim() ?? null,
    thumbnailReady: [...document.querySelectorAll("[data-pinned-card] img[data-lesson-thumb]")]
      .every((img) => img.complete && img.naturalWidth > 0),
    hasEmpty: Boolean(document.querySelector("[data-pinned-empty]")),
    hasManage: [...document.querySelectorAll("button")].some(
      (button) => button.textContent.trim() === "Kelola sematan"
    )
  };
})()`;

async function waitForHome(page, label) {
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label,
    timeoutMs: 30_000
  });
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  await waitForHome(page, "sapaan Beranda");

  await page.waitFor(
    `document.querySelector('[data-home-tab="available"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-pinned")?.hidden === true &&
     document.querySelector("[data-subject-card]") !== null`,
    { label: "keadaan awal tanpa sematan (tab Materi tersedia)" }
  );

  const initialTabs = await page.evaluate(homeTabs);
  assert(initialTabs.count === 3, `Beranda harus punya 3 tab, ditemukan ${initialTabs.count}.`);
  assert(
    initialTabs.labels[0].startsWith("Materi disematkan") &&
      initialTabs.labels[1] === "Materi tersedia" &&
      initialTabs.labels[2] === "Jelajahi materi",
    `Label tab tidak sesuai: ${initialTabs.labels.join(" | ")}.`
  );
  assert(
    initialTabs.panelsResolve,
    "Setiap tab harus menunjuk panel tabpanel yang ada di DOM."
  );
  assert(
    initialTabs.selected.length === 1 && initialTabs.selected[0] === "available",
    `Tanpa sematan, tab aktif harus "Materi tersedia" (aktif: ${
      initialTabs.selected.join(", ") || "tidak ada"
    }).`
  );
  assert(
    initialTabs.tabIndexes.filter((value) => value === 0).length === 1 &&
      initialTabs.tabIndexes[1] === 0,
    `Hanya tab aktif yang boleh masuk urutan Tab (${initialTabs.tabIndexes.join(", ")}).`
  );
  assert(
    initialTabs.visiblePanels.length === 1 && initialTabs.visiblePanels[0] === "available",
    `Tanpa sematan hanya panel Materi tersedia yang tampil (${initialTabs.visiblePanels.join(", ")}).`
  );
  log("Tanpa sematan, Beranda membuka tab Materi tersedia (tab lain tersembunyi).");
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot(path.join(artifactDir, "beranda-tab-tersedia.png"));

  const initialPanels = await page.evaluate(homePanels);
  assert(initialPanels.pinnedHidden, "Panel Materi disematkan harus tersembunyi di awal.");
  assert(
    initialPanels.pinnedEmpty?.includes("Belum ada materi yang disematkan"),
    `Panel sematan harus punya empty state jelas (${initialPanels.pinnedEmpty ?? "kosong"}).`
  );
  assert(initialPanels.subjectCards > 0, "Panel Materi tersedia harus berisi kartu mapel.");
  log("Panel Materi disematkan menyimpan empty state; kartu mapel ada di panel tersedia.");

  assert(
    (await page.evaluate(selectTab("pinned"))) === "clicked",
    "Tab Materi disematkan tidak dapat diklik."
  );
  await page.waitFor(
    `document.getElementById("home-panel-pinned")?.hidden === false &&
     document.getElementById("home-panel-available")?.hidden === true`,
    { label: "panel sematan setelah tab Materi disematkan dipilih" }
  );
  const pinnedTabPanels = await page.evaluate(homePanels);
  assert(
    !pinnedTabPanels.pinnedHidden &&
      pinnedTabPanels.availableHidden &&
      pinnedTabPanels.pinnedEmpty?.includes("Belum ada materi yang disematkan"),
    `Tab Materi disematkan harus menampilkan empty state saja (${JSON.stringify(pinnedTabPanels)}).`
  );
  log("Tab Materi disematkan menampilkan empty state beserta ajakan membuka Jelajah Materi.");

  await page.evaluate(`document.getElementById("home-tab-pinned")?.focus()`);
  await pressKey(page, "ArrowRight", 39);
  await page.waitFor(
    `document.querySelector('[data-home-tab="available"]')?.getAttribute("aria-selected") === "true" &&
     document.activeElement?.id === "home-tab-available"`,
    { label: "tab berpindah dengan panah kanan" }
  );
  await pressKey(page, "End", 35);
  await page.waitFor(
    `document.querySelector('[data-home-tab="explore"]')?.getAttribute("aria-selected") === "true" &&
     document.activeElement?.id === "home-tab-explore"`,
    { label: "tab terakhir dengan tombol End" }
  );
  await pressKey(page, "Home", 36);
  await page.waitFor(
    `document.querySelector('[data-home-tab="pinned"]')?.getAttribute("aria-selected") === "true" &&
     document.activeElement?.id === "home-tab-pinned"`,
    { label: "tab pertama dengan tombol Home" }
  );
  log("Navigasi tab dengan panah kanan, End, dan Home mengikuti pola tablist.");

  const pinCount = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("profile_get_active")
      .then((active) => window.__TAURI_INTERNALS__.invoke("pinned_list", { profileId: active.id }))
      .then((items) => items.length)
      .catch(() => -1)
  `);
  assert(pinCount === 0, `Sematan awal harus kosong, ditemukan ${pinCount}.`);

  await clickButton(page, "Buka Jelajah Materi");
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`,
    { label: "katalog dari empty state Beranda" }
  );
  log("Empty state Materi disematkan membuka Jelajah Materi.");

  assert(await page.evaluate(fillSearch("zakat")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `[...document.querySelectorAll("[data-pin-toggle]")].some(
      (button) => button.getAttribute("aria-label") === "Sematkan Zakat dan Infak"
    )`,
    { label: "tombol sematkan pada kartu Zakat dan Infak" }
  );
  const toggleResult = await page.evaluate(zakatPinToggle);
  assert(toggleResult === "clicked", `Tombol sematkan tidak dapat diklik (${toggleResult}).`);
  await page.waitFor(
    `(() => {
      const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      return Boolean(button) && button.getAttribute("aria-pressed") === "true";
    })()`,
    { label: "status sematkan aktif di katalog" }
  );
  const pinnedToggle = await page.evaluate(zakatCardPinState);
  assert(
    pinnedToggle.label === "Disematkan" && pinnedToggle.pressed === "true",
    `Tombol sematkan tidak berubah menjadi Disematkan (${JSON.stringify(pinnedToggle)}).`
  );
  log("Tombol Sematkan di kartu katalog berubah menjadi Disematkan (aria-pressed=true).");
  await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      button?.scrollIntoView({ block: "center" });
      return true;
    })()
  `);
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot(path.join(artifactDir, "katalog-sematkan.png"));

  await clickButton(page, "Beranda");
  await waitForHome(page, "Beranda setelah menyematkan");
  await page.waitFor(
    `document.querySelector("[data-pinned-card]") !== null &&
     document.querySelector('[data-home-tab="pinned"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-pinned")?.hidden === false`,
    { label: "kartu sematan di Beranda" }
  );
  const pinnedHome = await page.evaluate(homePinnedState);
  assert(pinnedHome.count === 1, `Beranda harus menampilkan 1 sematan, ditemukan ${pinnedHome.count}.`);
  assert(
    pinnedHome.title === "Zakat dan Infak",
    `Kartu sematan menampilkan "${pinnedHome.title}", seharusnya "Zakat dan Infak".`
  );
  assert(pinnedHome.thumbnailReady, "Thumbnail kartu sematan belum termuat.");
  assert(!pinnedHome.hasEmpty, "Empty state sematan masih tampil padahal ada sematan.");
  assert(pinnedHome.hasManage, "Tombol Kelola sematan tidak muncul saat ada sematan.");
  const pinnedTabState = await page.evaluate(homeTabs);
  assert(
    pinnedTabState.selected.length === 1 &&
      pinnedTabState.selected[0] === "pinned" &&
      pinnedTabState.visiblePanels.length === 1 &&
      pinnedTabState.visiblePanels[0] === "pinned",
    `Dengan sematan, tab awal harus "Materi disematkan" (${JSON.stringify(pinnedTabState.selected)}).`
  );
  log(
    "Materi yang disematkan otomatis jadi tab awal Beranda, lengkap dengan thumbnail dan Kelola sematan."
  );
  await page.screenshot(path.join(artifactDir, "beranda-disematkan.png"));

  await page.send("Page.reload");
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri setelah muat ulang" }
  );
  await waitForHome(page, "Beranda setelah muat ulang");
  await page.waitFor(
    `document.querySelector("[data-pinned-title]")?.textContent.includes("Zakat dan Infak") &&
     document.getElementById("home-panel-pinned")?.hidden === false`,
    { label: "sematan bertahan setelah muat ulang" }
  );
  const persisted = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("profile_get_active").then((active) =>
      window.__TAURI_INTERNALS__.invoke("pinned_list", { profileId: active.id })
    )
  `);
  assert(
    Array.isArray(persisted) &&
      persisted.length === 1 &&
      persisted[0].lessonId === "zakat" &&
      persisted[0].packageId === "kelas2-pai-b06-zakat",
    `Sematan tersimpan tidak sesuai: ${JSON.stringify(persisted)}`
  );
  log("Sematan bertahan setelah muat ulang dan terbaca dari SQLite (profil aktif).");

  await clickButton(page, "Kelola sematan");
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`,
    { label: "katalog dari Kelola sematan" }
  );
  assert(await page.evaluate(fillSearch("zakat")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `(() => {
      const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      return Boolean(button) && button.getAttribute("aria-pressed") === "true";
    })()`,
    { label: "status sematan terbaca ulang di katalog" }
  );
  log("Katalog memuat status sematan tersimpan (aria-pressed=true setelah buka ulang).");

  await clickButton(page, "Beranda");
  await waitForHome(page, "Beranda untuk melepas sematan");
  await page.waitFor(
    `document.querySelector('[data-pinned-card] button[aria-label="Lepas sematan Zakat dan Infak"]') !== null`,
    { label: "tombol Lepas pada kartu sematan" }
  );
  const unpin = await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("button")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      if (!button) return "missing";
      if (button.disabled) return "disabled";
      button.click();
      return "clicked";
    })()
  `);
  assert(unpin === "clicked", `Tombol Lepas tidak dapat diklik (${unpin}).`);
  await page.waitFor(
    `document.querySelector("[data-pinned-card]") === null &&
     document.querySelector('[data-home-tab="available"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-available")?.hidden === false`,
    { label: "kembali ke tab Materi tersedia setelah sematan habis" }
  );
  const afterUnpinPanels = await page.evaluate(homePanels);
  assert(
    afterUnpinPanels.pinnedHidden && !afterUnpinPanels.availableHidden,
    `Setelah sematan habis, panel Materi tersedia harus tampil (${JSON.stringify(afterUnpinPanels)}).`
  );
  log("Lepas sematan terakhir: Beranda pindah otomatis ke tab Materi tersedia.");

  await page.send("Page.reload");
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri setelah muat ulang kedua" }
  );
  await waitForHome(page, "Beranda setelah melepas sematan");
  await page.waitFor(
    `document.querySelector('[data-home-tab="available"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-pinned")?.hidden === true &&
     document.querySelector("[data-pinned-card]") === null &&
     document.querySelector("[data-subject-card]") !== null`,
    { label: "sematan tetap kosong setelah muat ulang" }
  );
  const afterUnpinEmpty = await page.evaluate(homePanels);
  assert(
    afterUnpinEmpty.pinnedEmpty?.includes("Belum ada materi yang disematkan"),
    "Empty state sematan harus tetap tersedia di panel Materi disematkan."
  );
  const afterUnpin = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("profile_get_active").then((active) =>
      window.__TAURI_INTERNALS__.invoke("pinned_list", { profileId: active.id })
    )
  `);
  assert(
    Array.isArray(afterUnpin) && afterUnpin.length === 0,
    `Sematan harus kosong setelah dilepas, ditemukan ${JSON.stringify(afterUnpin)}.`
  );
  log("Pelepasan sematan tersimpan permanen (pinned_list kosong setelah muat ulang).");
  await page.screenshot(path.join(artifactDir, "beranda-tanpa-sematan.png"));

  const exploreTab = await page.evaluate(selectTab("explore"));
  assert(exploreTab === "clicked", `Tab Jelajahi materi tidak dapat diklik (${exploreTab}).`);
  await page.waitFor(
    `document.querySelector('[data-home-tab="explore"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-explore")?.hidden === false`,
    { label: "panel Jelajahi materi" }
  );
  await page.waitFor(
    `window.__TAURI_INTERNALS__.invoke("profile_get_active").then((active) =>
      window.__TAURI_INTERNALS__.invoke("ui_state_get", { profileId: active.id, key: "home-tab" })
    ).then((value) => value === "explore")`,
    { label: "tab Beranda tersimpan" }
  );
  log("Tab Jelajahi materi tersimpan sebagai keadaan antarmuka profil.");

  await page.send("Page.reload");
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri setelah muat ulang ketiga" }
  );
  await waitForHome(page, "Beranda setelah memilih tab Jelajahi");
  await page.waitFor(
    `document.querySelector('[data-home-tab="explore"]')?.getAttribute("aria-selected") === "true" &&
     document.getElementById("home-panel-explore")?.hidden === false`,
    { label: "tab Jelajahi terbuka kembali" }
  );
  const restoredTabs = await page.evaluate(homeTabs);
  assert(
    restoredTabs.selected.length === 1 && restoredTabs.selected[0] === "explore",
    `Setelah muat ulang tab harus "explore", ditemukan ${JSON.stringify(restoredTabs.selected)}.`
  );
  log("Tab Beranda terakhir terbuka lagi setelah muat ulang (tersimpan per profil).");
}
