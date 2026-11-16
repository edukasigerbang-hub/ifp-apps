import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const PACKAGE_HASH = "#player/kelas1-matematika-b01-bilangan-1-10/bilangan-1-10";

async function boot(page, origin) {
  await page.send("Page.navigate", { url: `${origin}/?e2e=pen${PACKAGE_HASH}` });
  await page.waitFor(`window.location.search.includes("e2e=pen")`, {
    label: "dokumen baru (pena)",
    timeoutMs: 30_000
  });
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri",
    timeoutMs: 30_000
  });
  await page.waitFor(`Boolean(document.querySelector("[data-player-hero] h1"))`, {
    label: "hero Player",
    timeoutMs: 30_000
  });
  await page.waitFor(`document.body.textContent.includes("Langkah 1 dari 5")`, {
    label: "eksplorasi langkah 1",
    timeoutMs: 30_000
  });
  await page.waitFor(
    `(() => {
      const image = document.querySelector("[data-exploration-illustration]");
      return Boolean(image && image.complete && image.naturalWidth > 0);
    })()`,
    { label: "ilustrasi termuat" }
  );
}

const GEOMETRY = `(() => {
  const surface = document.querySelector("[data-exploration-pen-surface]");
  const canvas = document.querySelector("[data-exploration-pen-canvas]");
  const figure = document.querySelector("[data-exploration-stage] figure");
  const rail = document.querySelector("[data-exploration-stage] > div:last-child");
  const hintButton = [...document.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === "Petunjuk"
  );
  const rectOf = (node) => {
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  };
  return {
    surface: rectOf(surface),
    canvas: rectOf(canvas),
    figure: rectOf(figure),
    rail: rectOf(rail),
    hint: rectOf(hintButton),
    hintExpanded: hintButton?.getAttribute("aria-expanded") ?? null
  };
})()`;

const STATE = `(() => {
  const figure = document.querySelector("[data-exploration-stage] figure");
  const canvas = document.querySelector("[data-exploration-pen-canvas]");
  const toggle = document.querySelector("[data-exploration-pen-toggle]");
  const toolbar = document.querySelector("[data-exploration-pen-toolbar]");
  return {
    hasFigure: Boolean(figure),
    hasCanvas: Boolean(canvas),
    hasToggle: Boolean(toggle),
    togglePressed: toggle?.getAttribute("aria-pressed") ?? null,
    toggleHeight: toggle ? Math.round(toggle.getBoundingClientRect().height) : 0,
    hasToolbar: Boolean(toolbar),
    strokes: canvas ? Number(canvas.dataset.explorationPenStrokes) : -1,
    canvasWidth: canvas ? canvas.width : 0,
    canvasHeight: canvas ? canvas.height : 0,
    pointerEvents: canvas ? getComputedStyle(canvas).pointerEvents : null,
    figureHeight: figure ? Math.round(figure.getBoundingClientRect().height) : 0,
    toolbarButtons: toolbar
      ? [...toolbar.querySelectorAll("button")].map((button) => ({
          label: button.getAttribute("aria-label"),
          width: Math.round(button.getBoundingClientRect().width),
          height: Math.round(button.getBoundingClientRect().height)
        }))
      : [],
    selectedColor: toolbar
      ? toolbar.querySelector("[data-exploration-pen-color][aria-pressed='true']")?.getAttribute("data-exploration-pen-color") ?? null
      : null,
    penWidth: toolbar?.querySelector("[data-exploration-pen-width]")?.getAttribute("data-exploration-pen-width") ?? null,
    eraserPressed: toolbar?.querySelector("[data-exploration-pen-eraser]")?.getAttribute("aria-pressed") ?? null,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  };
})()`;

const PIXEL_COUNT = `(() => {
  const canvas = document.querySelector("[data-exploration-pen-canvas]");
  if (!canvas) return 0;
  const context = canvas.getContext("2d");
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let painted = 0;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) painted += 1;
  }
  return painted;
})()`;

async function state(page) {
  return page.evaluate(STATE);
}

async function geometry(page) {
  return page.evaluate(GEOMETRY);
}

async function pixelAt(page, x, y) {
  return page.evaluate(`(() => {
    const canvas = document.querySelector("[data-exploration-pen-canvas]");
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = Math.round(((${x} - rect.left) / rect.width) * canvas.width);
    const py = Math.round(((${y} - rect.top) / rect.height) * canvas.height);
    const { data } = canvas.getContext("2d").getImageData(px, py, 1, 1);
    return [data[0], data[1], data[2], data[3]];
  })()`);
}

async function click(page, selector, label) {
  const result = await page.evaluate(`
    (() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `${label} tidak dapat diklik (${result}).`);
}

async function mouseClick(page, x, y) {
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: Math.round(x),
    y: Math.round(y),
    button: "none",
    buttons: 0
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: Math.round(x),
    y: Math.round(y),
    button: "left",
    buttons: 1,
    clickCount: 1
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: Math.round(x),
    y: Math.round(y),
    button: "left",
    buttons: 0,
    clickCount: 1
  });
}

async function drawLine(page, from, to, steps = 12) {
  const startX = Math.round(from.x);
  const startY = Math.round(from.y);
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: startX,
    y: startY,
    button: "none",
    buttons: 0
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: startX,
    y: startY,
    button: "left",
    buttons: 1,
    clickCount: 1
  });
  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps;
    await page.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: Math.round(from.x + (to.x - from.x) * progress),
      y: Math.round(from.y + (to.y - from.y) * progress),
      button: "left",
      buttons: 1
    });
  }
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: Math.round(to.x),
    y: Math.round(to.y),
    button: "left",
    buttons: 0,
    clickCount: 1
  });
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri"
  });
  const origin = await page.evaluate("window.location.origin");

  await boot(page, origin);
  const initial = await state(page);
  const initialGeometry = await geometry(page);
  assert(initial.hasFigure, "Panggung eksplorasi tidak memuat figure ilustrasi.");
  assert(initial.hasCanvas, "Kanvas pena tidak dirender pada langkah eksplorasi.");
  assert(initial.hasToggle, "Tombol pena tidak tampil pada langkah eksplorasi.");
  assert(!initial.hasToolbar, "Toolbar pena sudah tampil sebelum pena dibuka.");
  assert(initial.strokes === 0, `Jumlah stroke awal = ${initial.strokes}, seharusnya 0.`);
  assert(initial.pointerEvents === "none", `Kanvas nonaktif masih menerima pointer (${initial.pointerEvents}).`);
  assert(initial.canvasWidth > 0 && initial.canvasHeight > 0, "Kanvas pena berukuran nol.");
  assert(initial.toggleHeight >= 44, `Tombol pena hanya ${initial.toggleHeight}px (minimum 44px).`);
  assert(
    Math.abs(initialGeometry.canvas.width - initialGeometry.surface.width) <= 2 &&
      Math.abs(initialGeometry.canvas.height - initialGeometry.surface.height) <= 2,
    `Kanvas ${Math.round(initialGeometry.canvas.width)}x${Math.round(initialGeometry.canvas.height)} ` +
      `tidak menutup seluruh area eksplorasi ${Math.round(initialGeometry.surface.width)}x${Math.round(initialGeometry.surface.height)}.`
  );
  assert(!initial.overflowX, "Halaman meluber horizontal setelah kanvas ditambahkan.");
  log(
    `Kanvas ${initial.canvasWidth}x${initial.canvasHeight} px menutup seluruh area eksplorasi; ` +
      `pena tertutup, ${initial.strokes} stroke.`
  );

  await click(page, "[data-exploration-pen-toggle]", "Tombol pena");
  await page.waitFor(`Boolean(document.querySelector("[data-exploration-pen-toolbar]"))`, {
    label: "toolbar pena terbuka"
  });
  const opened = await state(page);
  assert(!opened.hasToggle, "Tombol Pena masih tampil saat toolbar aktif.");
  assert(opened.pointerEvents !== "none", "Kanvas tetap menolak pointer setelah pena dibuka.");
  assert(opened.selectedColor === "#0f766e", `Warna awal = ${opened.selectedColor}, seharusnya teal.`);
  assert(opened.penWidth === "6", `Ketebalan awal = ${opened.penWidth}, seharusnya 6.`);
  assert(
    opened.figureHeight === initial.figureHeight,
    `Tinggi ilustrasi berubah ${initial.figureHeight} → ${opened.figureHeight} saat toolbar muncul.`
  );
  for (const button of opened.toolbarButtons) {
    assert(
      button.width >= 44 && button.height >= 44,
      `Tombol "${button.label}" berukuran ${button.width}x${button.height} (minimum 44x44).`
    );
  }
  log(`Toolbar terbuka dengan ${opened.toolbarButtons.length} tombol 44px; tinggi ilustrasi tetap ${opened.figureHeight}px.`);

  const geo = await geometry(page);
  const figure = geo.figure;
  const lineY = figure.top + figure.height * 0.58;

  await drawLine(
    page,
    { x: figure.left + figure.width * 0.22, y: lineY },
    { x: figure.left + figure.width * 0.78, y: lineY }
  );
  await page.waitFor(`document.querySelector("[data-exploration-pen-canvas]")?.dataset.explorationPenStrokes === "1"`, {
    label: "stroke pertama tercatat"
  });
  const firstPixels = await page.evaluate(PIXEL_COUNT);
  assert(firstPixels > 0, "Kanvas tidak memuat piksel setelah coretan pertama.");
  log(`Coretan teal di atas ilustrasi tercatat; ${firstPixels} piksel kanvas terisi.`);
  await page.screenshot(path.join(artifactDir, "pena-ilustrasi.png"));

  await click(page, '[data-exploration-pen-color="#dc2626"]', "Warna merah");
  await page.waitFor(
    `document.querySelector('[data-exploration-pen-color="#dc2626"]')?.getAttribute("aria-pressed") === "true"`,
    { label: "warna merah aktif" }
  );
  await click(page, "[data-exploration-pen-width]", "Ketebalan pena");
  await page.waitFor(
    `document.querySelector("[data-exploration-pen-width]")?.getAttribute("data-exploration-pen-width") === "11"`,
    { label: "ketebalan berputar ke 11" }
  );
  const redState = await state(page);
  assert(redState.selectedColor === "#dc2626", `Warna terpilih = ${redState.selectedColor}.`);
  assert(redState.penWidth === "11", `Ketebalan terpilih = ${redState.penWidth}.`);

  const surface = geo.surface;
  const railLineY = geo.rail.top + 24;
  await drawLine(
    page,
    { x: surface.left + 10, y: railLineY },
    { x: surface.left + surface.width - 10, y: railLineY }
  );
  await page.waitFor(`document.querySelector("[data-exploration-pen-canvas]")?.dataset.explorationPenStrokes === "2"`, {
    label: "stroke kedua tercatat"
  });
  const railSample = await pixelAt(page, surface.left + surface.width * 0.86, railLineY);
  assert(railSample !== null, "Sampel warna tidak terbaca.");
  assert(
    railSample[0] > 170 && railSample[1] < 110 && railSample[2] < 110 && railSample[3] > 0,
    `Piksel di area teks = ${railSample.join(",")}; coretan tidak melintasi seluruh area eksplorasi.`
  );
  log(
    `Coretan merah melintasi ilustrasi dan rel teks sampai tepi kanan; ` +
      `piksel rel = rgb(${railSample[0]}, ${railSample[1]}, ${railSample[2]}).`
  );
  await page.screenshot(path.join(artifactDir, "pena-seluruh-area.png"));

  const beforeHint = await page.evaluate(PIXEL_COUNT);
  const hintPoint = geo.hint;
  assert(hintPoint !== null, "Tombol Petunjuk tidak ditemukan pada langkah ini.");
  await mouseClick(page, hintPoint.left + hintPoint.width / 2, hintPoint.top + hintPoint.height / 2);
  await page.waitFor(
    `[...document.querySelectorAll("button")].some(
      (button) => button.textContent.trim() === "Petunjuk" && button.getAttribute("aria-expanded") === "true"
    )`,
    { label: "petunjuk terbuka lewat klik nyata" }
  );
  const afterHintOpen = await page.evaluate(PIXEL_COUNT);
  const afterHintState = await state(page);
  assert(afterHintState.strokes === 2, `Jumlah stroke berubah menjadi ${afterHintState.strokes} saat petunjuk dibuka.`);
  assert(
    afterHintOpen >= beforeHint * 0.9,
    `Piksel berkurang drastis ${beforeHint} → ${afterHintOpen} saat petunjuk dibuka.`
  );
  log("Klik nyata pada Petunjuk tetap sampai ke tombol; kanvas menyesuaikan tinggi tanpa menghapus coretan.");
  await page.screenshot(path.join(artifactDir, "pena-petunjuk-terbuka.png"));

  const hintOpenGeometry = await geometry(page);
  await mouseClick(
    page,
    hintOpenGeometry.hint.left + hintOpenGeometry.hint.width / 2,
    hintOpenGeometry.hint.top + hintOpenGeometry.hint.height / 2
  );
  await page.waitFor(
    `[...document.querySelectorAll("button")].every(
       (button) => button.textContent.trim() !== "Petunjuk" || button.getAttribute("aria-expanded") === "false"
     )`,
    { label: "petunjuk tertutup" }
  );

  await click(page, "[data-exploration-pen-eraser]", "Penghapus");
  await page.waitFor(
    `document.querySelector("[data-exploration-pen-eraser]")?.getAttribute("aria-pressed") === "true"`,
    { label: "mode hapus aktif" }
  );
  await drawLine(
    page,
    { x: surface.left + 20, y: railLineY },
    { x: surface.left + surface.width - 20, y: railLineY }
  );
  await page.waitFor(`document.querySelector("[data-exploration-pen-canvas]")?.dataset.explorationPenStrokes === "1"`, {
    label: "stroke merah terhapus"
  });
  log("Penghapus menghapus coretan merah yang melintasi rel teks.");

  await click(page, "[data-exploration-pen-undo]", "Urungkan");
  await page.waitFor(`document.querySelector("[data-exploration-pen-canvas]")?.dataset.explorationPenStrokes === "2"`, {
    label: "hapus diurungkan"
  });
  log("Urungkan memulihkan coretan yang terhapus.");

  const buttons = await page.evaluate(`
    [...document.querySelectorAll("button")]
      .filter((button) => button.getClientRects().length > 0)
      .map((button) => button.textContent.trim())
  `);
  assert(buttons.includes("Lanjut"), "Tombol Lanjut tidak dapat dijangkau saat pena aktif.");
  await click(page, "[data-exploration-pen-close]", "Selesai mencoret");
  await page.waitFor(`!document.querySelector("[data-exploration-pen-toolbar]")`, {
    label: "toolbar pena tertutup"
  });
  await click(page, "[data-exploration-pen-toggle]", "Buka pena lagi");
  await page.waitFor(`Boolean(document.querySelector("[data-exploration-pen-toolbar]"))`, {
    label: "toolbar pena dibuka ulang"
  });
  const reopened = await state(page);
  assert(reopened.strokes === 2, `Jumlah stroke setelah tutup/buka = ${reopened.strokes}.`);
  log("Toolbar dapat ditutup dan dibuka kembali tanpa kehilangan coretan.");

  await click(page, "[data-exploration-pen-close]", "Tutup pena");
  await page.waitFor(`!document.querySelector("[data-exploration-pen-toolbar]")`, {
    label: "toolbar tertutup sebelum pindah langkah"
  });
  const off = await state(page);
  assert(off.pointerEvents === "none", "Kanvas masih menerima pointer saat pena tertutup.");
  await drawLine(
    page,
    { x: figure.left + figure.width * 0.3, y: figure.top + 30 },
    { x: figure.left + figure.width * 0.6, y: figure.top + 30 }
  );
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stillTwo = await state(page);
  assert(stillTwo.strokes === 2, `Coretan bertambah saat pena tertutup (${stillTwo.strokes}).`);
  log("Pena tertutup: kanvas tidak menangkap coretan baru.");

  const navResult = await page.evaluate(`
    (() => {
      const target = [...document.querySelectorAll("button")]
        .find((button) => button.textContent.trim() === "Lanjut");
      if (!target) return "missing";
      target.click();
      return "clicked";
    })()
  `);
  assert(navResult === "clicked", "Tombol Lanjut tidak dapat diklik di bawah kanvas.");
  await page.waitFor(`document.body.textContent.includes("Langkah 2 dari 5")`, {
    label: "langkah 2"
  });
  const stepTwoPixels = await page.evaluate(PIXEL_COUNT);
  const stepTwoState = await state(page);
  assert(stepTwoState.strokes === 2, `Coretan hilang saat pindah langkah (${stepTwoState.strokes}).`);
  assert(stepTwoPixels > 0, "Kanvas langkah 2 kosong setelah coretan bertahan.");
  log(`Coretan bertahan di langkah 2: ${stepTwoPixels} piksel, ${stepTwoState.strokes} stroke.`);
  await page.screenshot(path.join(artifactDir, "pena-langkah-2.png"));

  await click(page, "[data-exploration-pen-toggle]", "Buka pena di langkah 2");
  await page.waitFor(`Boolean(document.querySelector("[data-exploration-pen-toolbar]"))`, {
    label: "toolbar pena di langkah 2"
  });
  await click(page, "[data-exploration-pen-clear]", "Hapus semua");
  await page.waitFor(`document.querySelector("[data-exploration-pen-canvas]")?.dataset.explorationPenStrokes === "0"`, {
    label: "semua coretan dihapus"
  });
  const cleared = await page.evaluate(PIXEL_COUNT);
  assert(cleared === 0, `Kanvas masih berisi ${cleared} piksel setelah Hapus semua.`);
  assert(!(await state(page)).overflowX, "Halaman meluber horizontal setelah pena dipakai.");
  log("Hapus semua mengosongkan kanvas di langkah 2.");
  await page.screenshot(path.join(artifactDir, "pena-kosong.png"));
}
