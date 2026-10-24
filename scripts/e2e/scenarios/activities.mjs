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
    "../../../content/packages/matematika-kelas3-pecahan"
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
    multiAnswer.activityId
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

  await clickButton(page, "Benar atau Salah");
  await page.waitFor(`document.body.textContent.includes("Periksa jawaban")`, {
    label: "kuis benar-salah"
  });
  assert(await chooseRadio(page, "bs-setengah", "true"), "Radio benar-salah 1 gagal.");
  assert(await chooseRadio(page, "bs-seperempat", "false"), "Radio benar-salah 2 gagal.");
  await clickButton(page, "Periksa jawaban");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor benar-salah"
  });
  await page.waitFor(`document.body.textContent.includes("Tersimpan lokal")`, {
    label: "simpan benar-salah",
    timeoutMs: 30_000
  });
  log("Aktivitas benar-salah dinilai 100 dan tersimpan.");

  await clickButton(page, "Jawaban Singkat");
  await page.waitFor(`document.body.textContent.includes("Tuliskan nama pecahan 1/2")`, {
    label: "kuis jawaban singkat"
  });
  assert(
    await fillByLabel(page, "Tuliskan nama pecahan 1/2.", "Setengah"),
    "Input jawaban singkat 1 gagal."
  );
  assert(
    await fillByLabel(
      page,
      "Tuliskan pecahan untuk satu bagian dari empat bagian.",
      "1/4"
    ),
    "Input jawaban singkat 2 gagal."
  );
  await clickButton(page, "Periksa jawaban");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor jawaban singkat"
  });
  await page.waitFor(`document.body.textContent.includes("Tersimpan lokal")`, {
    label: "simpan jawaban singkat",
    timeoutMs: 30_000
  });
  log("Aktivitas jawaban singkat dinilai 100 (normalisasi huruf) dan tersimpan.");

  await clickButton(page, "Pilihan Ganda (Pilih Semua)");
  await page.waitFor(`document.body.textContent.includes("Pilih semua pecahan yang senilai dengan 1/2")`, {
    label: "kuis multi-jawaban"
  });
  for (const [name, value] of [
    ["mg-setengah", "opsi-2-4"],
    ["mg-setengah", "opsi-3-6"],
    ["mg-seperempat", "opsi-1-4"],
    ["mg-seperempat", "opsi-2-8"]
  ]) {
    assert(await chooseCheckbox(page, name, value), `Checkbox ${name}/${value} gagal.`);
  }
  await clickButton(page, "Periksa jawaban");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor multi-jawaban"
  });
  await page.waitFor(`document.body.textContent.includes("Tersimpan lokal")`, {
    label: "simpan multi-jawaban",
    timeoutMs: 30_000
  });
  log("Aktivitas pilihan ganda multi-jawaban dinilai 100 dan tersimpan.");

  const profileId = await page.evaluate(
    `window.__TAURI_INTERNALS__.invoke("profile_get_active").then((profile) => profile.id)`
  );
  const summary = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("learning_get_summary", {
      profileId: ${JSON.stringify(profileId)}
    })
  `);
  assert(summary.attempts === 3, `Percobaan tersimpan ${summary.attempts}, harus 3.`);
  assert(summary.averageScore === 100, `Rata-rata ${summary.averageScore}, harus 100.`);
  log(`Ringkasan: ${summary.sessions} sesi, ${summary.attempts} percobaan, rata-rata ${summary.averageScore}.`);

  await page.screenshot(path.join(artifactDir, "activities.png"));
  log("Screenshot aktivitas baru tersimpan.");
}
