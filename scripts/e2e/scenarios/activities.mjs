import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

async function buildPackage(artifactDir) {
  const source = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../fixtures/pilot-pecahan-kelas3"
  );
  const target = path.join(artifactDir, "activities-package");
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });

  const activitiesDir = path.join(target, "activities");
  for (const file of await readdir(activitiesDir)) {
    await rm(path.join(activitiesDir, file), { force: true });
  }

  const trueFalse = {
    activityId: "aktivitas-benar-salah",
    type: "true-false",
    schemaVersion: "1.0.0",
    title: "Benar atau Salah",
    instructions: "Tentukan apakah setiap pernyataan benar atau salah.",
    assets: [],
    interactionConfig: {},
    assessmentConfig: {
      questions: [
        {
          questionId: "bs-setengah",
          prompt: "Satu bagian dari dua bagian sama besar adalah setengah.",
          responseType: "boolean",
          correctResponse: "true"
        },
        {
          questionId: "bs-seperempat",
          prompt: "1/4 lebih besar daripada 1/2.",
          responseType: "boolean",
          correctResponse: "false"
        }
      ],
      passingScore: 100
    },
    completionPolicy: { type: "score-threshold", threshold: 100 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: ["touch", "keyboard"]
  };

  const shortAnswer = {
    activityId: "aktivitas-jawaban-singkat",
    type: "short-answer",
    schemaVersion: "1.0.0",
    title: "Jawaban Singkat",
    instructions: "Tuliskan jawaban pada kolom yang tersedia.",
    assets: [],
    interactionConfig: {},
    assessmentConfig: {
      questions: [
        {
          questionId: "sa-setengah",
          prompt: "Tuliskan nama pecahan 1/2.",
          responseType: "text",
          correctResponse: "setengah"
        },
        {
          questionId: "sa-seperempat",
          prompt: "Tuliskan pecahan untuk satu bagian dari empat bagian.",
          responseType: "text",
          correctResponse: "1/4"
        }
      ],
      passingScore: 100
    },
    completionPolicy: { type: "score-threshold", threshold: 100 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: ["touch", "keyboard"]
  };

  const multiAnswer = {
    activityId: "aktivitas-pilihan-ganda-multi",
    type: "multiple-choice",
    schemaVersion: "1.0.0",
    title: "Pilihan Ganda (Pilih Semua)",
    instructions: "Pilih semua jawaban yang benar.",
    assets: [],
    interactionConfig: {},
    assessmentConfig: {
      questions: [
        {
          questionId: "mg-setengah",
          prompt: "Pilih semua pecahan yang senilai dengan 1/2.",
          responseType: "multiple-choice",
          options: [
            { optionId: "opsi-2-4", text: "2/4" },
            { optionId: "opsi-1-3", text: "1/3" },
            { optionId: "opsi-3-6", text: "3/6" }
          ],
          correctResponse: ["opsi-2-4", "opsi-3-6"]
        },
        {
          questionId: "mg-seperempat",
          prompt: "Pilih semua pecahan yang senilai dengan 1/4.",
          responseType: "multiple-choice",
          options: [
            { optionId: "opsi-1-4", text: "1/4" },
            { optionId: "opsi-2-8", text: "2/8" },
            { optionId: "opsi-2-4b", text: "2/4" }
          ],
          correctResponse: ["opsi-1-4", "opsi-2-8"]
        }
      ],
      passingScore: 100
    },
    completionPolicy: { type: "score-threshold", threshold: 100 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: ["touch", "keyboard"]
  };

  const matching = {
    activityId: "aktivitas-mencocokkan",
    type: "matching",
    schemaVersion: "1.0.0",
    title: "Mencocokkan Pecahan",
    instructions: "Pasangkan setiap pecahan dengan namanya.",
    assets: [],
    interactionConfig: {
      pairs: [
        { pairId: "pasangan-setengah", left: "1/2", right: "Setengah" },
        { pairId: "pasangan-seperempat", left: "1/4", right: "Seperempat" },
        { pairId: "pasangan-sepertiga", left: "1/3", right: "Sepertiga" }
      ]
    },
    completionPolicy: { type: "score-threshold", threshold: 100 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: ["touch", "keyboard"]
  };

  const ordering = {
    activityId: "aktivitas-mengurutkan",
    type: "ordering",
    schemaVersion: "1.0.0",
    title: "Mengurutkan Angka",
    instructions: "Urutkan angka dari terkecil ke terbesar.",
    assets: [],
    interactionConfig: {
      items: [
        { itemId: "angka-3", text: "Angka 3" },
        { itemId: "angka-1", text: "Angka 1" },
        { itemId: "angka-2", text: "Angka 2" }
      ],
      correctOrder: ["angka-1", "angka-2", "angka-3"]
    },
    completionPolicy: { type: "score-threshold", threshold: 100 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: ["touch", "keyboard"]
  };

  await writeFile(
    path.join(activitiesDir, "activity-tf.json"),
    `${JSON.stringify(trueFalse, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(activitiesDir, "activity-sa.json"),
    `${JSON.stringify(shortAnswer, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(activitiesDir, "activity-mg.json"),
    `${JSON.stringify(multiAnswer, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(activitiesDir, "activity-matching.json"),
    `${JSON.stringify(matching, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(activitiesDir, "activity-ordering.json"),
    `${JSON.stringify(ordering, null, 2)}\n`,
    "utf8"
  );

  const manifestPath = path.join(target, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.packageVersion = "0.3.0";
  manifest.title = "Aktivitas Uji — Benar/Salah & Jawaban Singkat";
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const lessonPath = path.join(target, "lessons", "lesson-001.json");
  const lesson = JSON.parse(await readFile(lessonPath, "utf8"));
  lesson.title = "Aktivitas Baru (E2E)";
  lesson.contentVersion = "0.3.0";
  lesson.activityIds = [
    trueFalse.activityId,
    shortAnswer.activityId,
    multiAnswer.activityId,
    matching.activityId,
    ordering.activityId
  ];
  lesson.assessmentRefs = [
    trueFalse.activityId,
    shortAnswer.activityId,
    multiAnswer.activityId
  ];
  await writeFile(lessonPath, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");

  return target;
}

async function fillByLabel(page, ariaLabel, value) {
  const focused = await page.evaluate(`
    (() => {
      const input = document.querySelector('input[aria-label=${JSON.stringify(ariaLabel)}]');
      if (!input) return false;
      input.focus();
      input.select();
      return document.activeElement === input;
    })()
  `);
  if (!focused) return false;
  await page.send("Input.insertText", { text: value });
  return page.evaluate(`
    (() => {
      const input = document.querySelector('input[aria-label=${JSON.stringify(ariaLabel)}]');
      return Boolean(input && input.value === ${JSON.stringify(value)});
    })()
  `);
}

async function waitForSaved(page, label) {
  const deadline = Date.now() + 30_000;
  let banner = "";
  let trail = "";
  while (Date.now() < deadline) {
    trail = await page.evaluate(`
      (() => ({
        banner: document.querySelector("[data-player-storage]")?.textContent.trim() ?? "",
        panel: Boolean(document.querySelector("#activity-panel")),
        heading: document.querySelector("main h1")?.textContent.trim() ?? "",
        hash: window.location.hash
      }))()
    `);
    banner = trail.banner;
    if (banner.includes("Tersimpan lokal")) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert(
    false,
    `Penyimpanan tidak selesai (${label}); banner "${banner}", panel ${trail.panel}, heading "${trail.heading}", hash "${trail.hash}".`
  );
}

async function chooseRadio(page, name, value) {
  return page.evaluate(`
    (() => {
      const input = document.querySelector('input[name=${JSON.stringify(name)}][value=${JSON.stringify(value)}]');
      if (!input) return false;
      input.click();
      return input.checked;
    })()
  `);
}

async function chooseCheckbox(page, name, value) {
  return page.evaluate(`
    (() => {
      const input = document.querySelector('input[name=${JSON.stringify(name)}][value=${JSON.stringify(value)}]');
      if (!input) return false;
      input.click();
      return input.checked;
    })()
  `);
}

async function choosePair(page, left, pairId) {
  return page.evaluate(`
    (() => {
      const select = document.querySelector('select[aria-label=${JSON.stringify(`Pasangkan ${left}`)}]');
      if (!select) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value"
      ).set;
      setter.call(select, ${JSON.stringify(pairId)});
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return select.value === ${JSON.stringify(pairId)};
    })()
  `);
}

async function clickByAriaLabel(page, label) {
  const result = await page.evaluate(`
    (() => {
      const button = document.querySelector('button[aria-label=${JSON.stringify(label)}]');
      if (!button) return "missing";
      if (button.disabled) return "disabled";
      button.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Tombol "${label}" tidak dapat diklik (${result}).`);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const packagePath = await buildPackage(artifactDir);
  const imported = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("content_import_package", { input: { sourcePath: ${JSON.stringify(packagePath)} } })
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
  assert(imported.ok, `Impor paket gagal: ${JSON.stringify(imported.error)}`);
  assert(imported.value.version === "0.3.0", `Versi ${imported.value.version}, harus 0.3.0.`);
  log(`Paket aktivitas diimpor (v${imported.value.version}, ${imported.value.files} file).`);

  await clickButton(page, "Player Pembelajaran");
  await page.waitFor(`document.body.textContent.includes("Aktivitas Baru (E2E)")`, {
    label: "lesson aktivitas baru"
  });
  await page.waitFor(`document.body.textContent.includes("Paket impor v0.3.0")`, {
    label: "paket impor aktif"
  });

  const layout = await page.evaluate(`
    (() => {
      const grid = document.querySelector("[data-player-layout]");
      const aside = document.querySelector("[data-player-aside]");
      const panel = document.querySelector("#activity-panel");
      if (!grid || !aside || !panel) return null;
      const g = grid.getBoundingClientRect();
      const a = aside.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      return {
        viewport: window.innerWidth,
        gridWidth: Math.round(g.width),
        panelWidth: Math.round(p.width),
        asideWidth: Math.round(a.width),
        asideRightOfPanel: a.left >= p.right - 1,
        asidePosition: getComputedStyle(aside).position,
        asideHeight: Math.round(a.height),
        gridHeight: Math.round(g.height),
        asideHasObjectives: aside.textContent.includes("Tujuan pembelajaran"),
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    })()
  `);
  assert(layout, "Grid dua kolom Player (kolom samping + panel aktivitas) tidak ditemukan.");
  assert(layout.asideHasObjectives, "Kartu Tujuan pembelajaran tidak berada di kolom samping.");
  assert(!layout.overflowX, `Layout Player menyebabkan gulir horizontal (lebar ${layout.viewport}px).`);
  if (layout.viewport >= 1024) {
    assert(layout.asideRightOfPanel, "Pada layar lebar, kolom samping tidak berada di kanan panel aktivitas.");
    assert(
      layout.asidePosition === "sticky",
      `Kolom samping tidak menempel (position: ${layout.asidePosition}).`
    );
    assert(
      layout.panelWidth / layout.gridWidth > 0.55,
      `Panel aktivitas hanya ${layout.panelWidth}px dari ${layout.gridWidth}px — kolom utama terlalu sempit.`
    );
    // Kuis satu-soal-per-halaman lebih pendek dari kartu samping, jadi ruang menempel
    // diuji secara oportunistik lewat blok `sticky` di bawah saat halaman benar-benar bergulir.
    log(
      `Layout Player dua kolom pada ${layout.viewport}px: panel ${layout.panelWidth}px, samping ${layout.asideWidth}px (tinggi ${layout.asideHeight}px dalam grid ${layout.gridHeight}px, position ${layout.asidePosition}).`
    );
  } else {
    assert(
      layout.asideWidth <= layout.gridWidth,
      "Kolom samping melebihi lebar kontainer pada layar sempit."
    );
    log(`Layout Player satu kolom pada ${layout.viewport}px (di bawah breakpoint lg).`);
  }

  const surfaces = await page.evaluate(`
    (() => {
      const hero = document.querySelector("[data-player-hero]");
      const cover = document.querySelector("[data-player-cover] img[data-cover-art]");
      const progress = document.querySelector("[data-player-progress]");
      const bar = progress?.querySelector('[role="progressbar"]');
      const summary = document.querySelector("[data-session-summary]");
      return {
        hero: Boolean(hero && hero.querySelector("h1")),
        coverLoaded: Boolean(cover && cover.complete && cover.naturalWidth > 0),
        coverSrc: cover ? cover.getAttribute("src") : null,
        progress: Boolean(progress && bar),
        progressMax: bar ? Number(bar.getAttribute("aria-valuemax")) : null,
        summary: Boolean(summary && summary.textContent.includes("Ringkasan sesi"))
      };
    })()
  `);
  assert(surfaces.hero, "Header Player (data-player-hero) dengan judul tidak ditemukan.");
  assert(surfaces.coverLoaded, `Cover header Player tidak termuat (src ${surfaces.coverSrc}).`);
  assert(surfaces.progress && surfaces.progressMax > 0, "Kartu Aktivitas & kemajuan tidak ditemukan.");
  assert(surfaces.summary, "Band Ringkasan sesi tidak ditemukan.");
  log(
    `Header Player memakai cover ${surfaces.coverSrc}; kartu kemajuan (maks ${surfaces.progressMax}) dan ringkasan sesi tampil.`
  );

  await clickButton(page, "Benar atau Salah");
  await page.waitFor(`document.body.textContent.includes("Soal 1 dari 2")`, {
    label: "kuis benar-salah"
  });
  const sequence = await page.evaluate(`
    (() => {
      const panel = document.querySelector("#activity-panel");
      const progress = panel?.querySelector("[data-quiz-progress]")?.textContent.trim() ?? "";
      const next = [...(panel?.querySelectorAll("button") ?? [])].find(
        (button) => button.textContent.trim() === "Lanjut"
      );
      return {
        fieldsets: panel?.querySelectorAll("fieldset").length ?? 0,
        progress,
        nextLabel: next?.textContent.trim() ?? null,
        nextDisabled: next ? next.disabled : null
      };
    })()
  `);
  assert(
    sequence.fieldsets === 1,
    `Kuis merender ${sequence.fieldsets} soal sekaligus, harus 1 soal per halaman.`
  );
  assert(
    sequence.progress === "Soal 1 dari 2",
    `Penanda kemajuan "${sequence.progress}", harus "Soal 1 dari 2".`
  );
  assert(sequence.nextLabel === "Lanjut", `Tombol soal pertama "${sequence.nextLabel}", harus "Lanjut".`);
  assert(sequence.nextDisabled === true, "Tombol Lanjut aktif sebelum soal pertama dijawab.");
  log("Kuis tampil satu soal per halaman dengan tombol Lanjut terkunci sebelum dijawab.");

  assert(await chooseRadio(page, "bs-setengah", "true"), "Radio benar-salah 1 gagal.");
  await clickButton(page, "Lanjut");
  await page.waitFor(`document.body.textContent.includes("1/4 lebih besar daripada 1/2")`, {
    label: "soal benar-salah 2"
  });
  assert(await chooseRadio(page, "bs-seperempat", "false"), "Radio benar-salah 2 gagal.");
  await clickButton(page, "Lihat hasil");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor benar-salah"
  });
  await waitForSaved(page, "simpan benar-salah");
  await page.waitFor(`document.activeElement?.textContent?.includes("Skor 100 dari 100")`, {
    label: "fokus kartu hasil benar-salah"
  });
  log("Aktivitas benar-salah dinilai 100, tersimpan, dan kartu hasil difokuskan.");

  const progress = await page.evaluate(`
    (() => {
      const card = document.querySelector("[data-player-progress]");
      const bar = card?.querySelector('[role="progressbar"]');
      const summary = document.querySelector("[data-session-summary]");
      if (!card || !bar || !summary) return null;
      return {
        now: Number(bar.getAttribute("aria-valuenow")),
        max: Number(bar.getAttribute("aria-valuemax")),
        cardText: card.textContent,
        summaryText: summary.textContent
      };
    })()
  `);
  assert(progress, "Kartu kemajuan atau ringkasan sesi hilang setelah penilaian.");
  assert(
    progress.now === 1 && progress.max === 5,
    `Kemajuan ${progress.now}/${progress.max}, harus 1/5.`
  );
  assert(progress.cardText.includes("Skor 100"), "Skor aktivitas tidak tampil di kartu kemajuan.");
  assert(
    progress.summaryText.includes("1 dari 5") && progress.summaryText.includes("100"),
    "Ringkasan sesi tidak memuat jumlah aktivitas dinilai dan skor terakhir."
  );
  log("Kartu kemajuan menandai 1/5 aktivitas berskor 100 dan ringkasan sesi ikut diperbarui.");

  await clickButton(page, "Jawaban Singkat");
  await page.waitFor(`document.body.textContent.includes("Tuliskan nama pecahan 1/2")`, {
    label: "kuis jawaban singkat"
  });
  assert(
    await fillByLabel(page, "Tuliskan nama pecahan 1/2.", "Setengah"),
    "Input jawaban singkat 1 gagal."
  );
  await clickButton(page, "Lanjut");
  await page.waitFor(
    `document.body.textContent.includes("Tuliskan pecahan untuk satu bagian dari empat bagian.")`,
    { label: "soal jawaban singkat 2" }
  );
  assert(
    await fillByLabel(
      page,
      "Tuliskan pecahan untuk satu bagian dari empat bagian.",
      "1/4"
    ),
    "Input jawaban singkat 2 gagal."
  );

  // Posisi soal harus bertahan setelah aplikasi dimuat ulang.
  await page.send("Page.reload");
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri setelah muat ulang" }
  );
  await page.waitFor(
    `[...document.querySelectorAll("button")].some(
      (button) => button.textContent.trim() === "Player Pembelajaran"
    )`,
    { label: "navigasi utama setelah muat ulang", timeoutMs: 30_000 }
  );
  await clickButton(page, "Player Pembelajaran");
  await page.waitFor(
    `document.body.textContent.includes("Aktivitas Baru (E2E)") &&
     document.body.textContent.includes("Paket impor v0.3.0")`,
    { label: "lesson aktivitas baru setelah muat ulang" }
  );
  await clickButton(page, "Jawaban Singkat");
  await page.waitFor(`document.body.textContent.includes("Soal 2 dari 2")`, {
    label: "posisi soal kuis dipulihkan"
  });
  await clickButton(page, "Sebelumnya");
  await page.waitFor(`document.body.textContent.includes("Tuliskan nama pecahan 1/2")`, {
    label: "soal 1 setelah mundur"
  });
  const restoredAnswer = await page.evaluate(
    `document.querySelector('input[aria-label="Tuliskan nama pecahan 1/2."]')?.value ?? null`
  );
  assert(
    restoredAnswer === "Setengah",
    `Jawaban soal 1 setelah muat ulang "${restoredAnswer}", harus "Setengah".`
  );
  log("Posisi soal dan jawaban kuis jawaban singkat dipulihkan setelah muat ulang.");
  await clickButton(page, "Lanjut");
  await page.waitFor(
    `document.body.textContent.includes("Tuliskan pecahan untuk satu bagian dari empat bagian.")`,
    { label: "soal jawaban singkat 2 setelah dipulihkan" }
  );
  // Jawaban soal 2 diketik tepat sebelum muat ulang, jadi masih dalam jeda
  // penyimpanan; soal 2 diisi ulang seperti pengguna yang melanjutkan.
  assert(
    await fillByLabel(
      page,
      "Tuliskan pecahan untuk satu bagian dari empat bagian.",
      "1/4"
    ),
    "Input jawaban singkat 2 setelah muat ulang gagal."
  );

  await clickButton(page, "Lihat hasil");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor jawaban singkat"
  });
  await waitForSaved(page, "simpan jawaban singkat");
  log("Aktivitas jawaban singkat dinilai 100 (normalisasi huruf) dan tersimpan.");

  await clickButton(page, "Ulangi kuis");
  const reset = await page.evaluate(`
    (() => {
      const panel = document.querySelector("#activity-panel");
      const progress = panel?.querySelector("[data-quiz-progress]")?.textContent.trim() ?? "";
      const checked = panel?.querySelectorAll("input:checked").length ?? 0;
      const next = [...(panel?.querySelectorAll("button") ?? [])].find(
        (button) => button.textContent.trim() === "Lanjut"
      );
      return { progress, checked, nextDisabled: next ? next.disabled : null };
    })()
  `);
  assert(
    reset.progress === "Soal 1 dari 2",
    `Ulangi kuis kembali ke "${reset.progress}", harus "Soal 1 dari 2".`
  );
  assert(reset.checked === 0, `Ulangi kuis menyisakan ${reset.checked} jawaban terpilih.`);
  assert(reset.nextDisabled === true, "Tombol Lanjut aktif setelah Ulangi kuis.");
  log("Ulangi kuis mengosongkan jawaban dan kembali ke soal pertama.");

  await clickButton(page, "Pilihan Ganda (Pilih Semua)");
  await page.waitFor(`document.body.textContent.includes("Pilih semua pecahan yang senilai dengan 1/2")`, {
    label: "kuis multi-jawaban"
  });
  for (const [name, value] of [
    ["mg-setengah", "opsi-2-4"],
    ["mg-setengah", "opsi-3-6"]
  ]) {
    assert(await chooseCheckbox(page, name, value), `Checkbox ${name}/${value} gagal.`);
  }
  await clickButton(page, "Lanjut");
  await page.waitFor(`document.body.textContent.includes("Pilih semua pecahan yang senilai dengan 1/4")`, {
    label: "soal multi-jawaban 2"
  });
  for (const [name, value] of [
    ["mg-seperempat", "opsi-1-4"],
    ["mg-seperempat", "opsi-2-8"]
  ]) {
    assert(await chooseCheckbox(page, name, value), `Checkbox ${name}/${value} gagal.`);
  }
  await clickButton(page, "Lihat hasil");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor multi-jawaban"
  });
  await waitForSaved(page, "simpan multi-jawaban");
  log("Aktivitas pilihan ganda multi-jawaban dinilai 100 dan tersimpan.");

  await clickButton(page, "Mencocokkan Pecahan");
  await page.waitFor(`document.body.textContent.includes("Pasangkan setiap pecahan")`, {
    label: "aktivitas mencocokkan"
  });
  for (const [left, pairId] of [
    ["1/2", "pasangan-setengah"],
    ["1/4", "pasangan-seperempat"],
    ["1/3", "pasangan-sepertiga"]
  ]) {
    assert(await choosePair(page, left, pairId), `Pasangan ${left} gagal dipilih.`);
  }
  await clickButton(page, "Periksa pasangan");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor mencocokkan"
  });
  await waitForSaved(page, "simpan mencocokkan");
  await page.waitFor(`document.activeElement?.textContent?.includes("Skor 100 dari 100")`, {
    label: "fokus kartu hasil mencocokkan"
  });
  log("Aktivitas mencocokkan dinilai 100, tersimpan, dan kartu hasil difokuskan.");

  await clickButton(page, "Mengurutkan Angka");
  await page.waitFor(`document.body.textContent.includes("Urutkan angka dari terkecil")`, {
    label: "aktivitas mengurutkan"
  });
  await clickByAriaLabel(page, "Naikkan Angka 1");
  await clickByAriaLabel(page, "Naikkan Angka 2");
  await clickButton(page, "Periksa urutan");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor mengurutkan"
  });
  await waitForSaved(page, "simpan mengurutkan");
  await page.waitFor(`document.activeElement?.textContent?.includes("Skor 100 dari 100")`, {
    label: "fokus kartu hasil mengurutkan"
  });
  log("Aktivitas mengurutkan dinilai 100, tersimpan, dan kartu hasil difokuskan.");

  const sticky = await page.evaluate(`
    (async () => {
      const aside = document.querySelector("[data-player-aside]");
      const scroller = document.scrollingElement ?? document.documentElement;
      if (!aside || !scroller) return null;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      if (maxScroll <= 120) {
        return { exercised: false, viewport: window.innerWidth };
      }
      const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      scroller.scrollTop = 0;
      await frame();
      const topBefore = Math.round(aside.getBoundingClientRect().top);
      const target = Math.min(maxScroll, Math.round(topBefore - 24) + 40);
      const extra = target - Math.round(topBefore - 24);
      scroller.scrollTop = target;
      await frame();
      const topAfter = Math.round(aside.getBoundingClientRect().top);
      scroller.scrollTop = 0;
      if (extra < 10) {
        return { exercised: false, viewport: window.innerWidth, maxScroll, topBefore };
      }
      return {
        exercised: true,
        maxScroll,
        topBefore,
        topAfter,
        extra,
        stuck: Math.abs(topAfter - 24) <= 2
      };
    })()
  `);
  if (sticky?.exercised && layout.viewport >= 1024) {
    assert(
      sticky.stuck,
      `Kolom samping tidak menempel saat menggulir ${sticky.extra}px (top ${sticky.topBefore} → ${sticky.topAfter}, harus 24).`
    );
    log(
      `Kolom samping menempel: top ${sticky.topBefore} → ${sticky.topAfter}px setelah menggulir ${sticky.extra}px.`
    );
  } else {
    log(
      `Kolom samping menempel: tidak diuji (${sticky?.exercised === false ? `ruang gulir ${sticky.maxScroll ?? 0}px` : "elemen tidak ditemukan"}).`
    );
  }

  const profileId = await page.evaluate(
    `window.__TAURI_INTERNALS__.invoke("profile_get_active").then((profile) => profile.id)`
  );
  const summary = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("learning_get_summary", {
      profileId: ${JSON.stringify(profileId)}
    })
  `);
  assert(summary.attempts === 5, `Percobaan tersimpan ${summary.attempts}, harus 5.`);
  assert(summary.averageScore === 100, `Rata-rata ${summary.averageScore}, harus 100.`);
  log(`Ringkasan: ${summary.sessions} sesi, ${summary.attempts} percobaan, rata-rata ${summary.averageScore}.`);

  await page.screenshot(path.join(artifactDir, "activities.png"));
  log("Screenshot aktivitas baru tersimpan.");

  await page.evaluate(
    `(() => {
      (document.scrollingElement ?? document.documentElement).scrollTop = 0;
      return true;
    })()`
  );
  await page.screenshot(path.join(artifactDir, "activities-hero.png"));
  log("Screenshot header Player (cover + ringkasan) tersimpan.");

  await clickButton(page, "Buka Hasil Belajar");
  await page.waitFor(
    `document.querySelector("h1")?.textContent.trim() === "Hasil Belajar"`,
    { label: "layar Hasil Belajar dari ringkasan sesi" }
  );
  log("Tombol Buka Hasil Belajar pada ringkasan sesi membuka layar Hasil Belajar.");
}
