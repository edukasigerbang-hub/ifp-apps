import path from "node:path";

const MATERIAL_URL = "#player/kelas4-matematika-b01-bilangan-cacah/bilangan-cacah-besar";
const EXPECTED_ASSETS = [
  "aktivitas-bilangan-cacah-1.png",
  "aktivitas-bilangan-cacah-2.png",
  "aktivitas-bilangan-cacah-3.png",
  "aktivitas-bilangan-cacah-4.png",
  "aktivitas-bilangan-cacah-5.png"
];
const EXPECTED_PROMPTS = [
  "Berapa bilangan yang ditunjukkan balok?",
  "Apa nilai tempat angka 3 pada 12.345?",
  "Apa nilai tempat angka 4 pada 12.345?",
  "Bagaimana membandingkan 12.345 dan 12.354?",
  "Bagaimana mengurutkan 12.345, 12.354, dan 12.435?"
];

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

function readStepIllustration() {
  return `(() => {
    const shared = document.querySelectorAll('[data-exploration-illustration="shared"]');
    const perStep = document.querySelectorAll('[data-exploration-illustration="step"]');
    const img = perStep[0] ?? null;
    return {
      shared: shared.length,
      perStep: perStep.length,
      loaded: Boolean(img && img.complete && img.naturalWidth > 0),
      src: img ? img.getAttribute("src") : null,
      alt: img ? img.getAttribute("alt") : null,
      progress: document.querySelector('[role="progressbar"][aria-label="Progres eksplorasi"]')
        ?.getAttribute("aria-valuenow") ?? null
    };
  })()`;
}

async function waitForStep(page, index, prompt) {
  const stepNumber = String(index + 1);
  await page.waitFor(
    `(() => {
      const progress = document.querySelector('[role="progressbar"][aria-label="Progres eksplorasi"]');
      const img = document.querySelector('[data-exploration-illustration="step"]');
      const promptShown = document.body.textContent.includes(${JSON.stringify(prompt)});
      return progress?.getAttribute("aria-valuenow") === ${JSON.stringify(stepNumber)}
        && promptShown
        && Boolean(img);
    })()`,
    { label: `langkah ${stepNumber}`, timeoutMs: 15_000 }
  );
  await page.waitFor(
    `(() => {
      const img = document.querySelector('[data-exploration-illustration="step"]');
      return Boolean(img && img.complete && img.naturalWidth > 0);
    })()`,
    { label: `ilustrasi langkah ${stepNumber} termuat`, timeoutMs: 15_000 }
  );
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  const origin = await page.evaluate("window.location.origin");
  await page.send("Page.navigate", { url: `${origin}/?e2e=ilustrasi${MATERIAL_URL}` });
  await page.waitFor(`window.location.search.includes("e2e=ilustrasi")`, {
    label: "dokumen baru",
    timeoutMs: 30_000
  });
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri setelah navigasi",
    timeoutMs: 30_000
  });
  await page.waitFor(
    `document.querySelector("[data-player-hero] h1")?.textContent.trim() === "Bilangan Cacah Besar"`,
    { label: "hero materi bilangan cacah besar", timeoutMs: 30_000 }
  );

  await clickButton(page, "Eksplorasi Terbimbing");

  const sources = [];
  const alts = [];
  for (let index = 0; index < EXPECTED_PROMPTS.length; index += 1) {
    const stepNumber = String(index + 1);
    await waitForStep(page, index, EXPECTED_PROMPTS[index]);
    const step = await page.evaluate(readStepIllustration());
    assert(step.shared === 0, `Langkah ${stepNumber} masih merender ${step.shared} ilustrasi bersama.`);
    assert(step.perStep === 1, `Langkah ${stepNumber} merender ${step.perStep} ilustrasi per langkah, harus 1.`);
    assert(step.loaded, `Ilustrasi langkah ${stepNumber} tidak termuat (src ${step.src}).`);
    assert(step.progress === stepNumber, `Progres langkah ${step.progress}, harus ${stepNumber}.`);
    assert(
      typeof step.src === "string" && step.src.endsWith(EXPECTED_ASSETS[index]),
      `Langkah ${stepNumber} memakai ${step.src}, harus berakhir ${EXPECTED_ASSETS[index]}.`
    );
    assert(
      typeof step.alt === "string" && step.alt.trim().length >= 20,
      `Alt ilustrasi langkah ${stepNumber} terlalu pendek (${step.alt}).`
    );
    sources.push(step.src);
    alts.push(step.alt.trim());
    log(`Langkah ${stepNumber}: ${step.src} · alt ${step.alt.trim().length} karakter.`);
    await page.screenshot(path.join(artifactDir, `ilustrasi-langkah-${stepNumber}.png`));

    if (index < EXPECTED_PROMPTS.length - 1) {
      await clickButton(page, "Lanjut");
    }
  }

  assert(new Set(sources).size === sources.length, `Ada gambar langkah yang sama: ${sources.join(", ")}.`);
  assert(new Set(alts).size === alts.length, "Ada alt langkah yang sama.");
  log("Lima langkah memakai lima berkas gambar dan lima teks alt berbeda.");

  await clickButton(page, "Sebelumnya");
  await waitForStep(page, 3, EXPECTED_PROMPTS[3]);
  const back = await page.evaluate(readStepIllustration());
  assert(back.shared === 0 && back.perStep === 1, "Ilustrasi per langkah hilang saat mundur satu langkah.");
  assert(back.src === sources[3], `Mundur ke langkah 4 memuat ${back.src}, harus ${sources[3]}.`);
  assert(back.alt.trim() === alts[3], "Alt langkah 4 berubah saat mundur.");
  await page.screenshot(path.join(artifactDir, "ilustrasi-langkah-4-kembali.png"));
  log("Mundur ke langkah 4 mengembalikan gambar dan alt langkah 4.");
}
