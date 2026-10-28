import { existsSync } from "node:fs";
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

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const packagePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../fixtures/pilot-pecahan-kelas3"
  );
  assert(existsSync(path.join(packagePath, "manifest.json")), `Paket tidak ditemukan: ${packagePath}`);
  log(`Paket sumber: ${packagePath}`);

  const imported = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("content_import_package", { input: { sourcePath: ${JSON.stringify(packagePath)} } })
      .then((result) => ({ ok: true, result }))
      .catch((error) => ({ ok: false, error }))
  `);
  assert(
    imported.ok,
    `Impor paket gagal: ${JSON.stringify(imported.error)}`
  );
  assert(imported.result?.packageId === "matematika-kelas3-pecahan", "Impor paket gagal.");
  assert(imported.result.files >= 7, `Jumlah file impor tidak wajar: ${imported.result.files}.`);
  log(
    `Paket diimpor & diaktifkan: ${imported.result.packageId} v${imported.result.version} ` +
      `(${imported.result.files} file).`
  );

  await clickButton(page, "Player Pembelajaran");
  await page.waitFor(`document.body.textContent.includes("Tujuan pembelajaran")`, {
    label: "Player dimuat"
  });
  await page.waitFor(`document.body.textContent.includes("Paket impor v0.1.0")`, {
    label: "sumber paket impor"
  });
  log("Player memuat paket hasil impor (managed-first).");

  await page.waitFor(`document.body.textContent.includes("Langkah 1 dari 4")`, {
    label: "eksplorasi langkah 1"
  });

  const controls = await page.evaluate(`
    (() => {
      const progress = document.querySelector('[aria-label="Progres eksplorasi"]');
      const scope = progress?.parentElement?.parentElement;
      if (!scope) return { missing: "lingkup eksplorasi" };
      const buttons = [...scope.querySelectorAll("button")];
      const byLabel = (label) => buttons.find((b) => b.textContent.trim() === label);
      const hint = byLabel("Lihat petunjuk");
      const reveal = byLabel("Tampilkan penjelasan");
      const next = byLabel("Lanjut");
      const prev = byLabel("Sebelumnya");
      if (!hint || !reveal || !next || !prev) {
        return { missing: "salah satu tombol eksplorasi" };
      }
      const primary = (button) => button.className.includes("bg-primary");
      const footer = next.parentElement;
      return {
        hintGroupedWithReveal: hint.parentElement === reveal.parentElement,
        supportSecondary: !primary(hint) && !primary(reveal),
        navSecondary: !primary(prev),
        primaryCount: buttons.filter(primary).length,
        footerShared: footer === prev.parentElement,
        footerSeparated: getComputedStyle(footer).borderTopWidth !== "0px",
        footerHoldsSupportButtons: footer.contains(hint) || footer.contains(reveal),
        prevDisabled: prev.disabled,
        hintControls: hint.getAttribute("aria-controls"),
        revealControls: reveal.getAttribute("aria-controls")
      };
    })()
  `);
  assert(!controls.missing, `Kontrol eksplorasi tidak lengkap: ${controls.missing}.`);
  assert(controls.hintGroupedWithReveal, "Tombol petunjuk & penjelasan tidak berada dalam satu baris.");
  assert(controls.supportSecondary, "Tombol petunjuk/penjelasan masih memakai gaya primer.");
  assert(controls.navSecondary, "Tombol Sebelumnya masih memakai gaya primer.");
  assert(controls.primaryCount === 1, `Tombol primer pada langkah eksplorasi ${controls.primaryCount}, harus 1.`);
  assert(controls.footerShared, "Sebelumnya dan Lanjut tidak berada dalam satu baris navigasi.");
  assert(controls.footerSeparated, "Baris navigasi eksplorasi tidak dipisahkan garis atas.");
  assert(!controls.footerHoldsSupportButtons, "Baris navigasi bercampur dengan tombol petunjuk/penjelasan.");
  assert(controls.prevDisabled, "Tombol Sebelumnya aktif pada langkah pertama.");
  log("Kontrol eksplorasi: 1 primer, petunjuk/penjelasan sekunder satu baris, navigasi terpisah.");

  await clickButton(page, "Lihat petunjuk");
  const hintState = await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("button")]
        .find((b) => b.textContent.trim() === "Sembunyikan petunjuk");
      const id = ${JSON.stringify(controls.hintControls)};
      return {
        expanded: button?.getAttribute("aria-expanded") === "true",
        panel: Boolean(id && document.getElementById(id)),
        label: button?.textContent.trim() ?? null
      };
    })()
  `);
  assert(hintState.expanded, "Tombol petunjuk tidak menandai aria-expanded=true.");
  assert(hintState.panel, `Panel petunjuk dengan id "${controls.hintControls}" tidak ditemukan.`);
  log("Petunjuk terbuka dan terhubung lewat aria-controls.");

  await clickButton(page, "Tampilkan penjelasan");
  await page.waitFor(
    `(() => {
      const id = ${JSON.stringify(controls.revealControls)};
      return Boolean(id && document.getElementById(id));
    })()`,
    { label: "panel penjelasan eksplorasi" }
  );
  await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("button")]
        .find((b) => b.textContent.trim() === "Sembunyikan penjelasan");
      button?.scrollIntoView({ block: "center" });
      return Boolean(button);
    })()
  `);
  await page.screenshot(path.join(artifactDir, "exploration-buttons.png"));
  log("Screenshot kontrol eksplorasi tersimpan.");

  await clickButton(page, "Lanjut");
  await clickButton(page, "Lanjut");
  await clickButton(page, "Lanjut");
  await page.waitFor(`document.body.textContent.includes("Langkah 4 dari 4")`, {
    label: "eksplorasi langkah 4"
  });
  await clickButton(page, "Selesai");
  await page.waitFor(`document.body.textContent.includes("Aktivitas selesai")`, {
    label: "eksplorasi selesai"
  });
  log("Eksplorasi 4 langkah selesai.");

  await clickButton(page, "Lanjut berlatih");
  await page.waitFor(`document.body.textContent.includes("Soal 1 dari 4")`, {
    label: "kuis tampil"
  });

  const quizOptions = ["opsi-setengah", "opsi-1-4", "opsi-besar", "opsi-2-3"];
  for (const [index, optionId] of quizOptions.entries()) {
    await page.waitFor(
      `document.body.textContent.includes("Soal ${index + 1} dari ${quizOptions.length}")`,
      { label: `soal kuis ${index + 1}` }
    );
    const perPage = await page.evaluate(
      `document.querySelectorAll("#activity-panel fieldset").length`
    );
    assert(perPage === 1, `Soal ${index + 1} dirender ${perPage} halaman, harus 1 soal per halaman.`);
    const chosen = await page.evaluate(`
      (() => {
        const input = document.querySelector('input[value="${optionId}"]');
        if (!input) return false;
        input.click();
        return input.checked;
      })()
    `);
    assert(chosen, `Opsi ${optionId} tidak dapat dipilih.`);
    if (index < quizOptions.length - 1) {
      await clickButton(page, "Lanjut");
    }
  }
  log("4 soal kuis dijawab satu per satu.");

  await clickButton(page, "Lihat hasil");
  await page.waitFor(`document.body.textContent.includes("Skor 100 dari 100")`, {
    label: "skor kuis"
  });
  await page.waitFor(`document.body.textContent.includes("Tersimpan lokal")`, {
    label: "penyimpanan lokal",
    timeoutMs: 30_000
  });
  const liveText = await page.evaluate(`
    [...document.querySelectorAll('[aria-live="polite"]')]
      .map((element) => element.textContent.trim())
      .filter(Boolean)
      .join(" | ")
  `);
  log(`Pesan status: ${liveText}`);
  log("Kuis dinilai 100 dan tersimpan lokal.");

  const activeProfile = await page.evaluate(
    `window.__TAURI_INTERNALS__.invoke("profile_get_active").then((profile) => profile.id)`
  );
  const summary = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("learning_get_summary", {
      profileId: ${JSON.stringify(activeProfile)}
    })
  `);
  assert(summary.sessions >= 1, `Sesi tidak tercatat (${summary.sessions}).`);
  assert(summary.attempts >= 1, `Percobaan tidak tercatat (${summary.attempts}).`);
  assert(summary.averageScore === 100, `Rata-rata skor ${summary.averageScore}, harus 100.`);
  log(`Ringkasan lokal: ${summary.sessions} sesi, ${summary.attempts} percobaan, rata-rata ${summary.averageScore}.`);

  const syncStatus = await page.evaluate(
    `window.__TAURI_INTERNALS__.invoke("sync_get_status").then((status) => status)`
  );
  assert(syncStatus.pending >= 1, `Outbox tidak berisi event (pending ${syncStatus.pending}).`);
  log(`Outbox berisi ${syncStatus.pending} event menunggu (tanpa backend pada E2E).`);

  await clickButton(page, "Hasil Belajar");
  await page.waitFor(`document.body.textContent.includes("Aktivitas terbaru")`, {
    label: "layar Hasil Belajar"
  });
  await page.waitFor(`document.body.textContent.includes("100")`, {
    label: "skor pada Hasil Belajar"
  });
  log("Hasil Belajar menampilkan skor 100.");

  await page.screenshot(path.join(artifactDir, "learning-journey.png"));
  log("Screenshot alur belajar tersimpan.");
}
