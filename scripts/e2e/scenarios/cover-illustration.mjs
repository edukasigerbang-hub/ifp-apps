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

function readIllustration() {
  return `(() => {
    const shared = document.querySelectorAll('[data-exploration-illustration="shared"]');
    const perStep = document.querySelectorAll('[data-exploration-illustration="step"]');
    const img = shared[0] ?? null;
    return {
      shared: shared.length,
      perStep: perStep.length,
      marked: Boolean(img && img.dataset.e2eMark === "tetap"),
      loaded: Boolean(img && img.complete && img.naturalWidth > 0),
      src: img ? img.getAttribute("src") : null,
      progress: document.querySelector('[role="progressbar"][aria-label="Progres eksplorasi"]')
        ?.getAttribute("aria-valuenow") ?? null
    };
  })()`;
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  const origin = await page.evaluate("window.location.origin");
  await page.send("Page.navigate", {
    url: `${origin}/?e2e=ilustrasi#player/kelas4-matematika-b01-bilangan-cacah/bilangan-cacah-besar`
  });
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
  await page.waitFor(`document.body.textContent.includes("Berapa bilangan yang ditunjukkan balok?")`, {
    label: "langkah pertama eksplorasi"
  });
  await page.waitFor(
    `(() => {
      const img = document.querySelector('[data-exploration-illustration="shared"]');
      return Boolean(img && img.complete && img.naturalWidth > 0);
    })()`,
    { label: "ilustrasi bersama termuat", timeoutMs: 15_000 }
  );

  const first = await page.evaluate(readIllustration());
  assert(first.shared === 1, `Langkah 1 merender ${first.shared} ilustrasi bersama, harus 1.`);
  assert(first.perStep === 0, `Langkah 1 masih merender ${first.perStep} gambar per langkah.`);
  assert(first.loaded, `Ilustrasi bersama tidak termuat (src ${first.src}).`);
  assert(first.progress === "1", `Progres langkah ${first.progress}, harus 1.`);
  log(`Langkah 1: satu ilustrasi (${first.src}) di atas langkah, tanpa gambar per langkah.`);
  await page.screenshot(path.join(artifactDir, "ilustrasi-langkah-1.png"));

  await page.evaluate(`
    (() => {
      const img = document.querySelector('[data-exploration-illustration="shared"]');
      img.dataset.e2eMark = "tetap";
      return true;
    })()
  `);

  for (const expected of ["2", "3"]) {
    await clickButton(page, "Lanjut");
    await page.waitFor(
      `document.querySelector('[role="progressbar"][aria-label="Progres eksplorasi"]')?.getAttribute("aria-valuenow") === ${JSON.stringify(expected)}`,
      { label: `langkah ${expected}` }
    );
    const step = await page.evaluate(readIllustration());
    assert(step.shared === 1, `Langkah ${expected} merender ${step.shared} ilustrasi bersama, harus 1.`);
    assert(step.perStep === 0, `Langkah ${expected} merender ${step.perStep} gambar per langkah.`);
    assert(step.loaded, `Ilustrasi hilang pada langkah ${expected}.`);
    assert(step.marked, `Ilustrasi langkah ${expected} dipasang ulang (node berganti).`);
    await page.screenshot(path.join(artifactDir, `ilustrasi-langkah-${expected}.png`));
  }
  log("Langkah 2 dan 3 tetap memakai simpul gambar yang sama (tidak dipasang ulang).");

  await clickButton(page, "Sebelumnya");
  await page.waitFor(
    `document.querySelector('[role="progressbar"][aria-label="Progres eksplorasi"]')?.getAttribute("aria-valuenow") === "2"`,
    { label: "kembali ke langkah 2" }
  );
  const back = await page.evaluate(readIllustration());
  assert(back.shared === 1 && back.marked, "Ilustrasi berganti saat mundur ke langkah sebelumnya.");
  log("Mundur satu langkah tidak menggandakan atau memasang ulang ilustrasi.");
}
