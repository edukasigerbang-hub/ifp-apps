import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const HERO = `document.querySelector("[data-player-hero] h1")`;

function readPlayer() {
  return `(() => {
    const hero = ${HERO};
    return {
      hash: window.location.hash,
      title: hero ? hero.textContent.trim() : null
    };
  })()`;
}

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
  await page.waitFor(`Boolean(${HERO})`, {
    label: `hero Player (${label})`,
    timeoutMs: 30_000
  });
  return page.evaluate(readPlayer());
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

function fillSearch(value) {
  return `
    (() => {
      const input = document.querySelector('input[aria-label="Cari materi"]');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()
  `;
}

async function openMaterial(page, exactTitle) {
  return page.evaluate(`
    (() => {
      const target = [...document.querySelectorAll("button")]
        .filter((button) => button.textContent.trim() === "Buka materi")
        .find(
          (button) =>
            (button.closest("li")?.querySelector("h2")?.textContent?.trim() ?? "") ===
            ${JSON.stringify(exactTitle)}
        );
      if (!target) return "missing";
      target.click();
      return "clicked";
    })()
  `);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  const origin = await page.evaluate("window.location.origin");
  log(`Asal aplikasi: ${origin}`);

  // 1. Muat ulang langsung pada deep link paket + lesson.
  const direct = await bootAt(
    page,
    origin,
    "zakat",
    "#player/kelas6-pai-b06-zakat/zakat",
    "deep link zakat"
  );
  assert(
    direct.title === "Zakat dan Infak",
    `Deep link menampilkan "${direct.title}", seharusnya "Zakat dan Infak".`
  );
  assert(
    direct.hash === "#player/kelas6-pai-b06-zakat/zakat",
    `Hash berubah menjadi "${direct.hash}" setelah dibuka langsung.`
  );
  log("Muat ulang di #player/<paket>/<lesson> membuka materi yang ditunjuk, bukan paket pertama.");
  await page.screenshot(path.join(artifactDir, "deeplink-zakat.png"));

  // 2. Deep link paket tanpa lesson jatuh ke lesson pertama, dan hash dilengkapi.
  const noLesson = await bootAt(
    page,
    origin,
    "ipas",
    "#player/kelas1-ipas-b01-tubuh-dan-indera",
    "deep link tanpa lesson"
  );
  assert(
    noLesson.title === "Tubuhku dan Inderaku",
    `Deep link tanpa lesson menampilkan "${noLesson.title}", seharusnya "Tubuhku dan Inderaku".`
  );
  assert(
    noLesson.hash === "#player/kelas1-ipas-b01-tubuh-dan-indera/tubuh-dan-indera",
    `Hash tidak dilengkapi lesson id: "${noLesson.hash}".`
  );
  log("Deep link tanpa lesson membuka lesson pertama dan hash dilengkapi lesson id.");

  // 3. Deep link ke paket tak dikenal tetap menampilkan Player dan hash diperbaiki.
  const unknown = await bootAt(
    page,
    origin,
    "tidak-ada",
    "#player/paket-tidak-ada/bab-tidak-ada",
    "deep link tak dikenal"
  );
  assert(
    typeof unknown.title === "string" && unknown.title.length > 0,
    "Player tidak menampilkan materi saat deep link menunjuk paket tak dikenal."
  );
  assert(
    unknown.hash.startsWith("#player/") && !unknown.hash.includes("paket-tidak-ada"),
    `Hash masih menunjuk paket tak dikenal: "${unknown.hash}".`
  );
  log(`Deep link tak dikenal jatuh ke "${unknown.title}" dan hash diperbaiki menjadi "${unknown.hash}".`);
  await page.screenshot(path.join(artifactDir, "deeplink-tak-dikenal.png"));

  const healed = await bootAt(page, origin, "pulih", unknown.hash, "hash hasil perbaikan");
  assert(
    healed.title === unknown.title && healed.hash === unknown.hash,
    `Hash hasil perbaikan tidak stabil: "${healed.hash}" vs "${unknown.hash}".`
  );
  log("Hash hasil perbaikan menunjuk materi yang sama setelah dimuat ulang (stabil).");

  // 4. Membuka materi dari katalog menulis hash deep link.
  await clickButton(page, "Jelajah Materi");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`, {
    label: "halaman katalog"
  });
  await page.waitFor(`document.body.textContent.includes("materi ditemukan.")`, {
    label: "jumlah materi"
  });
  assert(await page.evaluate(fillSearch("Pecahan Sederhana")), "Input pencarian tidak ditemukan.");
  await page.waitFor(`document.body.textContent.includes("Pecahan Sederhana")`, {
    label: "hasil pencarian pecahan sederhana"
  });
  assert(
    (await openMaterial(page, "Pecahan Sederhana")) === "clicked",
    "Kartu \"Pecahan Sederhana\" tidak dapat dibuka."
  );
  await page.waitFor(`${HERO}?.textContent.trim() === "Pecahan Sederhana"`, {
    label: "Player menampilkan Pecahan Sederhana"
  });
  const fromCatalog = await page.evaluate(readPlayer());
  assert(
    fromCatalog.hash === "#player/kelas3-matematika-b04-pecahan/pecahan-sederhana",
    `Hash setelah membuka dari katalog: "${fromCatalog.hash}".`
  );
  log(`Buka materi dari katalog menulis hash "${fromCatalog.hash}".`);
  await page.screenshot(path.join(artifactDir, "deeplink-dari-katalog.png"));

  // 5. Muat ulang pada hash itu harus tetap di materi yang sama.
  await page.evaluate(`window.__e2eBeforeReload = true`);
  await page.send("Page.reload");
  await page.waitFor(`window.__e2eBeforeReload === undefined`, {
    label: "dokumen setelah muat ulang",
    timeoutMs: 30_000
  });
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri setelah muat ulang",
    timeoutMs: 30_000
  });
  await page.waitFor(`Boolean(${HERO})`, {
    label: "hero Player setelah muat ulang",
    timeoutMs: 30_000
  });
  const reloaded = await page.evaluate(readPlayer());
  assert(
    reloaded.title === "Pecahan Sederhana" && reloaded.hash === fromCatalog.hash,
    `Setelah muat ulang: "${reloaded.title}" pada "${reloaded.hash}".`
  );
  log("Muat ulang langsung di Player tetap menampilkan materi yang sedang dibuka.");
  await page.screenshot(path.join(artifactDir, "deeplink-muat-ulang.png"));
}
