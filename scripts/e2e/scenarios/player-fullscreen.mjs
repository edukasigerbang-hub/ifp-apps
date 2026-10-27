import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const MEASURE = `(() => {
  const visible = (element) =>
    !!(element && element.getClientRects().length > 0 && getComputedStyle(element).display !== "none");
  const topBar = [...document.querySelectorAll("header")].find((header) =>
    header.querySelector("nav[aria-label='Breadcrumb']")
  );
  const shellNavs = [...document.querySelectorAll("nav, aside")].filter((node) => !node.closest("main"));
  const panel = document.getElementById("activity-panel");
  const panelBox = panel?.getBoundingClientRect();
  const visibleH1 = [...document.querySelectorAll("h1")].filter(visible);
  const toggle = [...document.querySelectorAll("button")]
    .filter(visible)
    .map((button) => button.textContent.trim())
    .find((text) => text === "Layar penuh" || text === "Keluar layar penuh");
  return {
    topBar: visible(topBar),
    shellNavs: shellNavs.filter(visible).length,
    hero: visible(document.querySelector("[data-player-hero]")),
    focusBar: visible(document.querySelector("[data-player-focus-bar]")),
    aside: visible(document.querySelector("[data-player-aside]")),
    objectives: visible(
      [...document.querySelectorAll("h2")].find((heading) =>
        heading.textContent.includes("Tujuan pembelajaran")
      )
    ),
    progress: visible(document.querySelector("[data-player-progress]")),
    summary: visible(document.querySelector("[data-session-summary]")),
    visibleH1: visibleH1.length,
    h1Text: visibleH1.map((heading) => heading.textContent.trim()).join(" | "),
    panelWidth: panelBox ? Math.round(panelBox.width) : 0,
    viewportWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    toggleLabel: toggle ?? null
  };
})()`;

async function measure(page) {
  return page.evaluate(MEASURE);
}

async function clickVisibleButton(page, label) {
  const result = await page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")].filter(
        (button) => button.textContent.trim() === ${JSON.stringify(label)}
      );
      const target = buttons.find((button) => button.getClientRects().length > 0);
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Tombol "${label}" tidak dapat diklik (${result}).`);
}

async function setViewport(page, width, height) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
}

async function clearViewport(page) {
  await page.send("Emulation.clearDeviceMetricsOverride");
  await new Promise((resolve) => setTimeout(resolve, 300));
}

async function pressEscape(page) {
  for (const type of ["rawKeyDown", "keyUp"]) {
    await page.send("Input.dispatchKeyEvent", {
      type,
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 27
    });
  }
  await new Promise((resolve) => setTimeout(resolve, 150));
}

// Cari tab aktivitas yang menampilkan kuis pilihan ganda, lalu pilih satu opsi.
async function answerOneQuizOption(page) {
  return page.evaluate(`
    (async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      for (const tab of [...document.querySelectorAll("[role='tab']")]) {
        tab.click();
        await wait(120);
        const inputs = [...document.querySelectorAll("#activity-panel input[type='radio']")];
        const enabled = inputs.find((input) => !input.disabled);
        if (!enabled) continue;
        (enabled.closest("label") ?? enabled).click();
        await wait(120);
        const chosen = [...document.querySelectorAll("#activity-panel input[type='radio']")].findIndex(
          (input) => input.checked
        );
        if (chosen === -1) continue;
        return { tabLabel: tab.textContent.trim(), chosen };
      }
      return null;
    })()
  `);
}

async function isAnswerKept(page, tabLabel, chosen) {
  return page.evaluate(`
    (() => {
      const tab = [...document.querySelectorAll("[role='tab']")].find(
        (button) => button.textContent.trim() === ${JSON.stringify(tabLabel)}
      );
      if (!tab || tab.getAttribute("aria-selected") !== "true") return false;
      const inputs = [...document.querySelectorAll("#activity-panel input[type='radio']")];
      return inputs[${chosen}]?.checked === true;
    })()
  `);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, { label: "bridge Tauri" });
  await page.waitFor(`document.body.textContent.includes("Jelajah Materi")`, { label: "shell aplikasi" });
  await clickVisibleButton(page, "Player Pembelajaran");
  await page.waitFor(`document.querySelector("[data-player-hero]")?.getClientRects().length > 0`, { label: "Player layar normal" });

  const report = { generatedAt: new Date().toISOString(), viewports: [] };

  for (const { width, height } of [
    { width: 1280, height: 800 },
    { width: 1024, height: 768 }
  ]) {
    await setViewport(page, width, height);

    const normal = await measure(page);
    assert(normal.hero && normal.aside && normal.progress && normal.objectives && normal.summary, `Layar ${width}px: bagian normal Player hilang.`);
    assert(normal.topBar && normal.shellNavs > 0, `Layar ${width}px: chrome shell tidak terlihat pada mode normal.`);
    assert(normal.visibleH1 === 1, `Layar ${width}px normal: jumlah <h1> terlihat = ${normal.visibleH1}.`);
    assert(!normal.overflow, `Layar ${width}px normal: overflow horizontal.`);
    assert(normal.toggleLabel === "Layar penuh", `Tombol layar penuh tidak ditemukan (${normal.toggleLabel}).`);
    await page.screenshot(path.join(artifactDir, `player-normal-${width}.png`));

    await clickVisibleButton(page, "Layar penuh");
    await page.waitFor(
      `!document.querySelector("[data-player-hero]")?.getClientRects().length`,
      { label: "hero Player tersembunyi" }
    );
    const fullscreen = await measure(page);
    assert(!fullscreen.hero, `Layar ${width}px fullscreen: hero masih terlihat.`);
    assert(!fullscreen.aside && !fullscreen.objectives && !fullscreen.progress, `Layar ${width}px fullscreen: panel tujuan/kemajuan masih terlihat.`);
    assert(!fullscreen.summary, `Layar ${width}px fullscreen: ringkasan sesi masih terlihat.`);
    assert(!fullscreen.topBar && fullscreen.shellNavs === 0, `Layar ${width}px fullscreen: chrome shell masih terlihat.`);
    assert(fullscreen.focusBar, `Layar ${width}px fullscreen: bar fokus tanpa judul tidak terlihat.`);
    assert(fullscreen.visibleH1 === 1, `Layar ${width}px fullscreen: jumlah <h1> terlihat = ${fullscreen.visibleH1}.`);
    assert(!fullscreen.overflow, `Layar ${width}px fullscreen: overflow horizontal.`);
    assert(fullscreen.toggleLabel === "Keluar layar penuh", `Label tombol keluar tidak berubah (${fullscreen.toggleLabel}).`);
    assert(
      fullscreen.panelWidth > normal.panelWidth,
      `Layar ${width}px: panel aktivitas tidak melebar (${normal.panelWidth} → ${fullscreen.panelWidth}).`
    );
    await page.screenshot(path.join(artifactDir, `player-fullscreen-${width}.png`));

    const answered = await answerOneQuizOption(page);
    if (answered) {
      await clickVisibleButton(page, "Keluar layar penuh");
      await page.waitFor(`document.querySelector("[data-player-hero]")?.getClientRects().length`, {
        label: "hero Player muncul kembali"
      });
      assert(await isAnswerKept(page, answered.tabLabel, answered.chosen), `Jawaban kuis hilang saat keluar layar penuh.`);
      await clickVisibleButton(page, "Layar penuh");
      await page.waitFor(`!document.querySelector("[data-player-hero]")?.getClientRects().length`, {
        label: "hero Player tersembunyi lagi"
      });
      assert(await isAnswerKept(page, answered.tabLabel, answered.chosen), `Jawaban kuis hilang saat masuk layar penuh.`);
      log(
        `Layar ${width}px: jawaban kuis pada "${answered.tabLabel}" tetap tersimpan saat mode layar penuh dibuka-tutup.`
      );
    } else {
      log(`Layar ${width}px: tidak ada aktivitas kuis pilihan ganda pada paket ini; pemeriksaan jawaban dilewati.`);
    }

    await clickVisibleButton(page, "Keluar layar penuh");
    await page.waitFor(`document.querySelector("[data-player-hero]")?.getClientRects().length > 0`, { label: "kembali ke layar normal" });
    const restored = await measure(page);
    assert(restored.hero && restored.aside && restored.summary, `Layar ${width}px: layout normal tidak pulih setelah keluar layar penuh.`);

    report.viewports.push({ width, height, normal, fullscreen, answered: answered?.tabLabel ?? null });
    log(
      `Layar ${width}px: panel aktivitas ${normal.panelWidth}px → ${fullscreen.panelWidth}px ` +
        `dari ${fullscreen.viewportWidth}px; chrome, tujuan pembelajaran, kartu kemajuan dan ringkasan sesi tersembunyi.`
    );
  }

  await setViewport(page, 1280, 800);
  await clickVisibleButton(page, "Layar penuh");
  await page.waitFor(`!document.querySelector("[data-player-hero]")?.getClientRects().length`, {
    label: "layar penuh aktif"
  });
  await pressEscape(page);
  await page.waitFor(`document.querySelector("[data-player-hero]")?.getClientRects().length > 0`, { label: "Escape menutup layar penuh" });
  log("Tombol Escape keluar dari mode layar penuh.");
  await clearViewport(page);

  const { writeFile } = await import("node:fs/promises");
  await writeFile(
    path.join(artifactDir, "player-fullscreen.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  log(`Laporan pengukuran ditulis ke player-fullscreen.json (${report.viewports.length} viewport).`);
}
