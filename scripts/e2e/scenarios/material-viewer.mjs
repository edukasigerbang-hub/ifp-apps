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

async function clickSelector(page, selector) {
  const result = await page.evaluate(`
    (() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Elemen "${selector}" tidak dapat diklik (${result}).`);
}

// Iframe materi berjalan sebagai proses terpisah (OOPIF), jadi ia tidak muncul
// di Page.getFrameTree milik target halaman; ia perlu sesi CDP sendiri.
async function iframeSession(page) {
  const { targetInfos } = await page.send("Target.getTargets");
  const target = targetInfos.find(
    (info) => info.type === "iframe" && info.url.startsWith("http://ifp-content.localhost/")
  );
  assert(target, "target iframe materi tidak ditemukan.");
  const { sessionId } = await page.send("Target.attachToTarget", {
    targetId: target.targetId,
    flatten: true
  });
  return sessionId;
}

async function frameEvaluate(page, sessionId, expression) {
  const result = await page.send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId
  );
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "Evaluasi iframe gagal."
    );
  }
  return result.result?.value;
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

async function setViewport(page, width, height) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  });
  await page.waitFor(`window.innerWidth === ${width}`, { label: `viewport ${width}px` });
}

async function measureViewer(page) {
  return page.evaluate(`
    (() => {
      const dialog = document.querySelector("[data-material-viewer]");
      const frame = document.querySelector("[data-material-frame]");
      const transcript = document.querySelector("[data-material-transcript]");
      const box = (element) => {
        const rect = element?.getBoundingClientRect();
        return rect ? { left: Math.round(rect.left), width: Math.round(rect.width) } : null;
      };
      return {
        mode: dialog?.getAttribute("data-material-view-mode") ?? null,
        dialog: box(dialog),
        frame: box(frame),
        transcript: box(transcript),
        transcriptPositioned: transcript ? getComputedStyle(transcript).position : null,
        kicker: [...(dialog?.querySelectorAll("header p") ?? [])]
          .map((node) => node.textContent)
          .some((text) => text.includes("Materi HTML5")),
        contentWidth: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    })()
  `);
}

const MODE_ORDER = ["kartu", "lansekap", "layar-penuh"];

async function setViewerMode(page, wanted) {
  for (let step = 0; step < MODE_ORDER.length; step += 1) {
    const current = await page.evaluate(
      `document.querySelector("[data-material-viewer]")?.getAttribute("data-material-view-mode")`
    );
    if (current === wanted) {
      return;
    }
    const expected = MODE_ORDER[(MODE_ORDER.indexOf(current) + 1) % MODE_ORDER.length];
    await clickSelector(page, "[data-material-view-mode-toggle]");
    await page.waitFor(
      `document.querySelector("[data-material-viewer]")?.getAttribute("data-material-view-mode") === ${JSON.stringify(expected)}`,
      { label: `mode ${expected}` }
    );
  }
  throw new Error(`Mode "${wanted}" tidak tercapai lewat tombol tampilan.`);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri"
  });
  await page.waitFor(`document.body.textContent.includes("Jelajah Materi")`, {
    label: "shell aplikasi"
  });

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(`document.body.textContent.includes("Materi HTML5 (prototipe)")`, {
    label: "bagian materi HTML5"
  });
  log("Layar Konten menampilkan bagian materi HTML5.");

  await clickSelector(page, "[data-material-open]");
  await page.waitFor(`document.querySelector("[data-material-viewer]") !== null`, {
    label: "penampil materi terbuka"
  });
  await page.waitFor(`document.querySelector("[data-material-status='siap']") !== null`, {
    label: "materi siap",
    timeoutMs: 25_000
  });
  log("Penampil terbuka dan menerima pesan ready dari iframe.");

  const frame = await page.evaluate(`
    (() => {
      const frame = document.querySelector("[data-material-frame]");
      if (!frame) return null;
      let crossOrigin = false;
      try {
        crossOrigin = frame.contentDocument === null;
      } catch {
        crossOrigin = true;
      }
      return {
        src: frame.getAttribute("src"),
        sandbox: frame.getAttribute("sandbox"),
        referrerPolicy: frame.getAttribute("referrerpolicy"),
        allow: frame.getAttribute("allow"),
        crossOrigin,
        dialogRole: document.querySelector("[data-material-viewer]")?.getAttribute("role"),
        modal: document.querySelector("[data-material-viewer]")?.getAttribute("aria-modal")
      };
    })()
  `);
  assert(frame !== null, "iframe materi tidak ditemukan.");
  assert(
    frame.src.startsWith("http://ifp-content.localhost/"),
    `iframe harus memakai protokol ifp-content (src: ${frame.src}).`
  );
  assert(
    frame.sandbox === "allow-scripts allow-forms allow-same-origin allow-popups",
    `sandbox iframe harus "allow-scripts allow-forms allow-same-origin allow-popups" (didapat: ${frame.sandbox}).`
  );
  // Pemutar pihak ketiga di dalam materi butuh Referer (YouTube menolak tanpa itu,
  // Error 153) dan butuh izin layar penuh diwarisi dari rantai frame.
  assert(
    frame.referrerPolicy === "origin",
    `referrerpolicy iframe materi harus "origin" (didapat: ${frame.referrerPolicy}).`
  );
  assert(
    frame.allow === "fullscreen; autoplay; encrypted-media; picture-in-picture",
    `allow iframe materi harus mendelegasikan izin pemutar (didapat: ${frame.allow}).`
  );
  assert(
    frame.crossOrigin,
    "Dokumen materi harus tetap tidak terbaca induk (asal ifp-content berbeda dari asal aplikasi)."
  );
  assert(frame.dialogRole === "dialog" && frame.modal === "true", "Penampil harus dialog modal.");
  log(`iframe tersandbox: ${frame.src}`);

  await page.waitFor(
    `Number(document.querySelector("[data-material-progress]")?.getAttribute("data-material-progress")) >= 34`,
    { label: "progres materi dari iframe", timeoutMs: 20_000 }
  );
  const progress = await page.evaluate(
    `document.querySelector("[data-material-progress]").getAttribute("data-material-progress")`
  );
  log(`Progres materi diterima induk: ${progress}%.`);

  await clickSelector(page, "[data-material-transcript-toggle]");
  await page.waitFor(`document.querySelector("[data-material-transcript]") !== null`, {
    label: "panel transkrip"
  });
  const transcript = await page.evaluate(
    `document.querySelector("[data-material-transcript]").textContent`
  );
  assert(transcript.includes("SIKLUS AIR"), "Transkrip materi harus memuat isi naratif.");
  assert(transcript.includes("PENGUAPAN"), "Transkrip harus memuat seluruh adegan.");
  log("Panel transkrip memuat isi naratif lengkap.");
  await clickSelector(page, "[data-material-transcript-toggle]");
  await page.waitFor(`document.querySelector("[data-material-transcript]") === null`, {
    label: "panel transkrip tertutup"
  });

  await setViewport(page, 1600, 900);
  await setViewerMode(page, "kartu");
  const kartu = await measureViewer(page);
  assert(
    kartu.dialog.width >= 900 && kartu.dialog.width <= 1030,
    `Mode kartu harus tetap kartu ±1024 px (didapat ${kartu.dialog.width}).`
  );
  assert(kartu.kicker, "Mode kartu menampilkan keterangan materi.");

  await setViewerMode(page, "lansekap");
  const lansekap = await measureViewer(page);
  assert(
    lansekap.dialog.width > kartu.dialog.width + 300,
    `Lansekap harus mengisi jendela, bukan berhenti di 1024 px (${kartu.dialog.width} → ${lansekap.dialog.width}).`
  );
  assert(!lansekap.overflow, "Lansekap: overflow horizontal terdeteksi.");

  await setViewerMode(page, "layar-penuh");
  const penuh = await measureViewer(page);
  assert(
    penuh.frame.width >= lansekap.frame.width,
    `Layar penuh tidak boleh lebih sempit dari lansekap (${lansekap.frame.width} → ${penuh.frame.width}).`
  );
  // `position:fixed; inset:0` membentang sebatas viewport di luar bilah gulir klasik,
  // jadi pembandingnya clientWidth, bukan innerWidth.
  assert(
    penuh.dialog.width >= penuh.contentWidth - 2,
    `Layar penuh harus memenuhi lebar konten jendela (${penuh.dialog.width} dari ${penuh.contentWidth}).`
  );
  assert(!penuh.kicker, "Layar penuh menyembunyikan keterangan dan metadata materi.");
  log(
    `Tiga mode terukur: pemutar ${kartu.frame.width}px (kartu) → ${lansekap.frame.width}px (lansekap) → ${penuh.frame.width}px (layar penuh).`
  );

  await setViewerMode(page, "lansekap");
  await clickSelector(page, "[data-material-transcript-toggle]");
  await page.waitFor(`document.querySelector("[data-material-transcript]") !== null`, {
    label: "transkrip dampingan"
  });
  const sideBySide = await measureViewer(page);
  assert(
    sideBySide.transcriptPositioned !== "absolute",
    "Di mode lebar transkrip harus mendampingi, bukan menutupi pemutar."
  );
  assert(
    sideBySide.transcript.width + sideBySide.frame.width <= sideBySide.dialog.width + 2 &&
      sideBySide.transcript.left >= sideBySide.frame.left + sideBySide.frame.width - 2,
    `Transkrip tidak diletakkan di samping pemutar (frame ${sideBySide.frame.left}+${sideBySide.frame.width}, transkrip ${sideBySide.transcript.left}).`
  );
  log(`Transkrip mendampingi pemutar di mode lansekap: ${sideBySide.transcript.width}px.`);
  await clickSelector(page, "[data-material-transcript-toggle]");
  await page.waitFor(`document.querySelector("[data-material-transcript]") === null`, {
    label: "transkrip tertutup kembali"
  });

  // Sengaja ditutup pada mode kartu: di jendela 1600 px tanpa preferensi tersimpan
  // penampil akan jatuh ke lansekap, jadi buka-ulang membuktikan preferennya dibaca.
  await setViewerMode(page, "kartu");

  await page.screenshot(path.join(artifactDir, "material-viewer.png"));

  await pressEscape(page);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil tertutup oleh Esc"
  });
  log("Esc menutup penampil dari shell.");

  await clickSelector(page, "[data-material-open]");
  await page.waitFor(`document.querySelector("[data-material-status='siap']") !== null`, {
    label: "materi siap (kedua)"
  });
  const restored = await measureViewer(page);
  assert(
    restored.mode === "kartu",
    `Mode tampilan harus diingat per profil setelah penampil dibuka ulang (didapat: ${restored.mode}).`
  );
  log("Mode tampilan diingat per profil lewat state ui perangkat.");
  // `completion.minDwellSeconds` = 2, jadi induk baru menerima `complete`
  // setelah materi dibuka lebih dari dua detik. Langkah ketiga (progres 100%)
  // baru tercapai pada 3,2 detik sehingga dwell pasti terpenuhi.
  await page.waitFor(
    `Number(document.querySelector("[data-material-progress]")?.getAttribute("data-material-progress")) >= 100`,
    { label: "dwell minimum terpenuhi", timeoutMs: 20_000 }
  );
  const frameSession = await iframeSession(page);
  const completed = await frameEvaluate(
    page,
    frameSession,
    `(() => {
      const button = document.getElementById("complete");
      if (!button) return "missing";
      button.click();
      return button.textContent;
    })()`
  );
  assert(completed === "Sudah ditandai", `Tombol selesai di dalam iframe tidak bekerja (${completed}).`);
  await page.waitFor(`document.querySelector("[data-material-status='selesai']") !== null`, {
    label: "sinyal complete diterima induk",
    timeoutMs: 10_000
  });
  log("Sinyal complete dari iframe diterima induk setelah dwell minimum.");

  await frameEvaluate(page, frameSession, `document.getElementById("exit").click()`);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil tertutup oleh request-exit"
  });
  log("Pesan request-exit dari iframe menutup penampil.");

  const closed = await page.evaluate(
    `({ viewer: document.querySelector("[data-material-viewer]") === null, frames: document.querySelectorAll("iframe").length })`
  );
  assert(closed.viewer && closed.frames === 0, "iframe harus dilepas setelah penampil ditutup.");
  await page.send("Emulation.clearDeviceMetricsOverride");
}
