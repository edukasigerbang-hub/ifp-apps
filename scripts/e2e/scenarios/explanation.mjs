import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const PACKAGE_HASH = "#player/kelas1-matematika-b01-bilangan-1-10/bilangan-1-10";
const COMPARISON_HASH = "#player/kelas4-matematika-b01-bilangan-cacah/bilangan-cacah-besar";

async function bootAt(page, origin, tag, hash, label) {
  await page.send("Page.navigate", { url: `${origin}/?e2e=${tag}${hash}` });
  await page.waitFor(`window.location.search.includes("e2e=${tag}")`, {
    label: `dokumen baru (${label})`,
    timeoutMs: 30_000
  });
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: `bridge Tauri (${label})`,
    timeoutMs: 30_000
  });
  await page.waitFor(`Boolean(document.querySelector("[data-player-hero] h1"))`, {
    label: `hero Player (${label})`,
    timeoutMs: 30_000
  });
  return page.evaluate(`document.querySelector("[data-player-hero] h1").textContent.trim()`);
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

async function clickTrigger(page) {
  const result = await page.evaluate(`
    (() => {
      const target = document.querySelector("[data-exploration-explanation-open]");
      if (!target) return "missing";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Pemicu pembahasan tidak dapat diklik (${result}).`);
}

const MEASURE = `(() => {
  const section = document.querySelector("[data-exploration-explanation]");
  const heading = section?.querySelector("h2") ?? null;
  const body = section
    ? [...section.querySelectorAll("div")].find((node) => node.className.includes("overflow-y-auto"))
    : null;
  const stage = document.querySelector("[data-exploration-stage]");
  return {
    open: Boolean(section),
    stageVisible: Boolean(stage && stage.getClientRects().length > 0),
    headingText: heading ? heading.textContent.trim() : null,
    headingId: heading?.id ?? null,
    labelledBy: section?.getAttribute("aria-labelledby") ?? null,
    headingFocused: document.activeElement === heading,
    paragraphCount: body ? body.querySelectorAll("p").length : 0,
    firstParagraph: body?.querySelector("p")?.textContent.trim().slice(0, 60) ?? null,
    bodyWidth: body ? Math.round(body.getBoundingClientRect().width) : 0,
    bodyHeight: body ? Math.round(body.getBoundingClientRect().height) : 0,
    bodyScrollHeight: body?.scrollHeight ?? 0,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    triggerCount: document.querySelectorAll("[data-exploration-explanation-open]").length
  };
})()`;

async function measure(page) {
  return page.evaluate(MEASURE);
}

async function advanceToCompletion(page, log) {
  for (let step = 2; step <= 5; step += 1) {
    await clickButton(page, "Lanjut");
    await page.waitFor(`document.body.textContent.includes("Langkah ${step} dari 5")`, {
      label: `langkah ${step}`
    });
  }
  await clickButton(page, "Selesai");
  await page.waitFor(`document.body.textContent.includes("Aktivitas selesai")`, {
    label: "kartu selesai"
  });
  log("Lima langkah diselesaikan; kartu selesai tampil.");
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  const origin = await page.evaluate("window.location.origin");

  const title = await bootAt(page, origin, "pembahasan", PACKAGE_HASH, "paket contoh");
  assert(title === "Bilangan 1–10", `Deep link menampilkan "${title}", seharusnya "Bilangan 1–10".`);
  await page.waitFor(`document.body.textContent.includes("Langkah 1 dari 5")`, {
    label: "eksplorasi langkah 1"
  });

  const stepView = await measure(page);
  assert(!stepView.open, "Pembahasan sudah terbuka sebelum pemicu ditekan.");
  assert(stepView.stageVisible, "Panggung eksplorasi tidak terlihat pada langkah 1.");
  assert(stepView.triggerCount === 1, `Jumlah pemicu pembahasan = ${stepView.triggerCount}, seharusnya 1.`);
  log("Paket contoh menampilkan satu pemicu pembahasan di rel teks langkah 1.");

  await clickTrigger(page);
  await page.waitFor(`Boolean(document.querySelector("[data-exploration-explanation]"))`, {
    label: "pembahasan terbuka"
  });
  await page.waitFor(
    `document.activeElement === document.querySelector("[data-exploration-explanation] h2")`,
    { label: "fokus pindah ke judul pembahasan" }
  );
  const opened = await measure(page);
  assert(opened.headingText === "Membilang, menulis lambang, dan mengurutkan 1–10", `Judul pembahasan: "${opened.headingText}".`);
  assert(opened.labelledBy === opened.headingId && Boolean(opened.headingId), "Section pembahasan tidak diberi label oleh judulnya.");
  assert(opened.paragraphCount === 5, `Jumlah paragraf = ${opened.paragraphCount}, seharusnya 5.`);
  assert(!opened.stageVisible, "Panggung langkah masih terlihat saat pembahasan dibuka.");
  assert(!opened.overflowX, "Pembahasan menimbulkan overflow horizontal.");
  assert(opened.bodyWidth > 0 && opened.bodyWidth <= 720, `Kolom baca ${opened.bodyWidth}px melewati batas 70ch.`);
  log(
    `Pembahasan terbuka: ${opened.paragraphCount} paragraf, kolom ${opened.bodyWidth}px, ` +
      `tinggi ${opened.bodyHeight}/${opened.bodyScrollHeight}px, fokus di judul.`
  );
  await page.screenshot(path.join(artifactDir, "pembahasan-terbuka.png"));

  await clickButton(page, "Kembali ke langkah");
  await page.waitFor(`!document.querySelector("[data-exploration-explanation]")`, {
    label: "pembahasan tertutup"
  });
  await page.waitFor(
    `document.activeElement === document.querySelector("[data-exploration-explanation-open]")`,
    { label: "fokus kembali ke pemicu" }
  );
  const closed = await measure(page);
  assert(closed.stageVisible, "Panggung langkah tidak pulih setelah pembahasan ditutup.");
  assert(closed.triggerCount === 1, "Pemicu pembahasan tidak kembali setelah ditutup.");
  log("Kembali ke langkah memulihkan panggung eksplorasi dan fokus ke pemicu.");

  await advanceToCompletion(page, log);
  const completionButtons = await page.evaluate(`
    [...document.querySelectorAll("button")]
      .filter((button) => button.getClientRects().length > 0)
      .map((button) => button.textContent.trim())
  `);
  for (const label of ["Ulangi eksplorasi", "Baca pembahasan lengkap", "Lanjut berlatih"]) {
    assert(completionButtons.includes(label), `Kartu selesai tidak memuat tombol "${label}".`);
  }
  await page.screenshot(path.join(artifactDir, "pembahasan-kartu-selesai.png"));

  await clickButton(page, "Baca pembahasan lengkap");
  await page.waitFor(`Boolean(document.querySelector("[data-exploration-explanation]"))`, {
    label: "pembahasan dari kartu selesai"
  });
  const afterCompletion = await page.evaluate(`
    [...document.querySelectorAll("button")]
      .filter((button) => button.getClientRects().length > 0)
      .map((button) => button.textContent.trim())
  `);
  assert(afterCompletion.includes("Kembali ke langkah"), "Pembahasan tidak menawarkan kembali ke langkah.");
  assert(afterCompletion.includes("Lanjut berlatih"), "Pembahasan setelah selesai tidak menawarkan lanjut berlatih.");
  await page.screenshot(path.join(artifactDir, "pembahasan-setelah-selesai.png"));
  log("Kartu selesai membuka pembahasan dengan tombol kembali dan lanjut berlatih.");

  await clickButton(page, "Lanjut berlatih");
  await page.waitFor(
    `[...document.querySelectorAll("[role='tab']")].some(
      (tab) => tab.getAttribute("aria-selected") === "true" && tab.textContent.includes("Kuis")
    )`,
    { label: "tab kuis aktif" }
  );
  log("Lanjut berlatih dari pembahasan berpindah ke tab kuis.");

  const comparisonTitle = await bootAt(page, origin, "tanpa-pembahasan", COMPARISON_HASH, "paket pembanding");
  assert(
    comparisonTitle === "Bilangan Cacah Besar",
    `Paket pembanding menampilkan "${comparisonTitle}".`
  );
  await page.waitFor(`document.body.textContent.includes("Langkah 1 dari 5")`, {
    label: "eksplorasi paket pembanding"
  });
  const comparison = await measure(page);
  assert(!comparison.open, "Paket tanpa field explanation membuka pembahasan secara tak terduga.");
  assert(comparison.triggerCount === 0, `Paket tanpa explanation menampilkan ${comparison.triggerCount} pemicu.`);
  log(`Paket "${comparisonTitle}" tanpa field explanation tidak menampilkan pemicu.`);
  await page.screenshot(path.join(artifactDir, "pembahasan-tanpa-pemicu.png"));
}
