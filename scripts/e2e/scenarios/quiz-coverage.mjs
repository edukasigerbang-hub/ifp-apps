import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function setViewport(page, width, height) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
}

async function clickButton(page, label) {
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

async function openMaterial(page, titleFragment) {
  return page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")].filter(
        (button) => button.textContent.trim() === "Buka materi"
      );
      const target = buttons.find((button) => {
        const title = button.closest("li")?.querySelector("h2")?.textContent?.trim() ?? "";
        return title.includes(${JSON.stringify(titleFragment)});
      });
      if (!target) return "missing";
      target.click();
      return "clicked";
    })()
  `);
}

const TAB_STATE = `(() => {
  const tabs = [...document.querySelectorAll("[role='tab']")];
  const list = tabs[0]?.parentElement;
  const rows = new Set(tabs.map((tab) => Math.round(tab.getBoundingClientRect().top)));
  return {
    labels: tabs.map((tab) => tab.textContent.trim()),
    rows: rows.size,
    height: list ? Math.round(list.getBoundingClientRect().height) : 0,
    quizTabPresent: tabs.some((tab) => tab.textContent.trim() === "Kuis Penguatan")
  };
})()`;

export async function run({ page, artifactDir, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, { label: "bridge Tauri" });
  await page.waitFor(`document.body.textContent.includes("Jelajah Materi")`, { label: "shell aplikasi" });
  await setViewport(page, 1280, 800);

  await clickButton(page, "Jelajah Materi");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`, {
    label: "katalog materi",
  });

  const targets = [
    { title: "Menyimak Cerita", expected: 4 },
    { title: "Mengenal Huruf dan Suku Kata", expected: 3 },
  ];

  for (const target of targets) {
    await clickButton(page, "Jelajah Materi");
    await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`, {
      label: "katalog materi",
    });
    await page.waitFor(
      `[...document.querySelectorAll("button")].some((button) => button.textContent.trim() === "Buka materi")`,
      { label: "kartu materi" },
    );
    const opened = await openMaterial(page, target.title);
    assert(opened === "clicked", `Materi "${target.title}" tidak dapat dibuka (${opened}).`);
    await page.waitFor(`!!document.querySelector("[data-player-hero]")`, {
      label: `Player "${target.title}"`,
    });
    await page.waitFor(`document.querySelectorAll("[role='tab']").length > 0`, { label: "tab aktivitas" });

    const state = await page.evaluate(TAB_STATE);
    assert(
      state.labels.length === target.expected,
      `${target.title}: jumlah tab ${state.labels.length}, harusnya ${target.expected} (${state.labels.join(" | ")}).`,
    );
    if (target.expected === 4) {
      assert(
        state.quizTabPresent,
        `${target.title}: tab "Kuis Penguatan" tidak ada (${state.labels.join(" | ")}).`,
      );
    }

    await page.screenshot(
      path.join(artifactDir, `tabs-${target.expected}-${target.title.replace(/\s+/g, "-")}.png`),
    );
    log(
      `${target.title}: ${state.labels.length} tab (${state.labels.join(" | ")}) pada ${state.rows} baris; tinggi baris ${state.height}px.`,
    );
  }

  // Kuis baru: pastikan soal benar-benar dirender dan bisa dijawab.
  const quiz = await page.evaluate(`
    (() => {
      const tabs = [...document.querySelectorAll("[role='tab']")];
      const quizTab = tabs.find((tab) => tab.textContent.trim() === "Kuis Penguatan");
      if (!quizTab) return { status: "missing" };
      quizTab.click();
      return { status: "clicked" };
    })()
  `);
  assert(quiz.status === "clicked", "Tab Kuis Penguatan tidak dapat diklik.");
  await page.waitFor(`document.querySelectorAll("#activity-panel input[type='radio']").length >= 5`, {
    label: "soal kuis baru",
  });

  const answered = await page.evaluate(`
    (() => {
      const fieldsets = [...document.querySelectorAll("#activity-panel fieldset")];
      let picked = 0;
      for (const fieldset of fieldsets) {
        const input = [...fieldset.querySelectorAll("input[type='radio']")].find((entry) => !entry.disabled);
        if (!input) continue;
        (input.closest("label") ?? input).click();
        picked += 1;
      }
      const submit = [...document.querySelectorAll("#activity-panel button")].find(
        (button) => button.textContent.trim() === "Periksa jawaban"
      );
      return { questions: fieldsets.length, picked, submitEnabled: submit ? !submit.disabled : false };
    })()
  `);
  assert(answered.questions >= 5, `Kuis baru hanya punya ${answered.questions} soal.`);
  assert(answered.picked === answered.questions, "Tidak semua soal dapat dijawab.");
  assert(answered.submitEnabled, "Tombol Periksa jawaban tetap nonaktif setelah semua soal dijawab.");

  await page.screenshot(path.join(artifactDir, "quiz-baru-terjawab.png"));
  log(`Kuis baru: ${answered.questions} soal dirender, semua dapat dijawab, tombol periksa aktif.`);

  await clickButton(page, "Periksa jawaban");
  await page.waitFor(`document.body.textContent.includes("Skor")`, { label: "hasil kuis" });
  const scored = await page.evaluate(`
    (() => {
      const text = document.querySelector("#activity-panel")?.textContent ?? "";
      const match = text.match(/Skor\\s+(\\d+)\\s+dari\\s+100/);
      return match ? Number(match[1]) : null;
    })()
  `);
  assert(scored !== null, "Skor kuis tidak tampil setelah diperiksa.");
  assert(scored >= 0 && scored <= 100, `Skor di luar rentang: ${scored}.`);
  log(`Kuis baru dinilai: skor ${scored} dari 100 tampil.`);

  await setViewport(page, 1024, 768);
  await page.screenshot(path.join(artifactDir, "quiz-baru-1024.png"));
  await page.send("Emulation.clearDeviceMetricsOverride");
  await new Promise((resolve) => setTimeout(resolve, 250));
}
