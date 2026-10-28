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

const pinnedLayout = `(() => {
  const pinned = document.querySelector("[data-pinned-section]");
  const subjectCard = document.querySelector("[data-subject-card]");
  const available = subjectCard ? subjectCard.closest("section") : null;
  const explore = document.querySelector("[data-explore-section]");
  const top = (node) =>
    node ? node.getBoundingClientRect().top + window.scrollY : -1;
  return {
    hasPinned: Boolean(pinned),
    hasAvailable: Boolean(available),
    hasExplore: Boolean(explore),
    ordered:
      Boolean(pinned && available && explore) &&
      top(pinned) < top(available) &&
      top(available) < top(explore),
    headings: [...document.querySelectorAll("main h2")].map((heading) =>
      heading.textContent.trim()
    )
  };
})()`;

const zakatPinToggle = `(() => {
  const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
    (node) => node.getAttribute("aria-label") === "Sematkan Zakat dan Infak"
  );
  if (!button) return "missing";
  if (button.disabled) return "disabled";
  button.click();
  return "clicked";
})()`;

const zakatCardPinState = `(() => {
  const card = [...document.querySelectorAll("main li")].find((node) =>
    node.querySelector("h2")?.textContent.includes("Zakat dan Infak")
  );
  const button = card?.querySelector("[data-pin-toggle]");
  if (!button) return "missing";
  return {
    pressed: button.getAttribute("aria-pressed"),
    label: button.textContent.trim()
  };
})()`;

const homePinnedState = `(() => {
  const card = document.querySelector("[data-pinned-card]");
  return {
    count: document.querySelectorAll("[data-pinned-card]").length,
    title: card?.querySelector("h3")?.textContent.trim() ?? null,
    thumbnailReady: [...document.querySelectorAll("[data-pinned-card] img[data-lesson-thumb]")]
      .every((img) => img.complete && img.naturalWidth > 0),
    hasEmpty: Boolean(document.querySelector("[data-pinned-empty]")),
    hasManage: [...document.querySelectorAll("button")].some(
      (button) => button.textContent.trim() === "Kelola sematan"
    )
  };
})()`;

async function waitForHome(page, label) {
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Halo")`, {
    label,
    timeoutMs: 30_000
  });
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  await waitForHome(page, "sapaan Beranda");

  await page.waitFor(
    `document.querySelector("[data-pinned-empty]")?.textContent.includes("Belum ada materi yang disematkan") &&
     document.querySelector("[data-subject-card]") !== null`,
    { label: "keadaan awal tanpa sematan" }
  );

  const initial = await page.evaluate(pinnedLayout);
  assert(initial.hasPinned, "Seksi Materi disematkan tidak ada di Beranda.");
  assert(initial.hasAvailable, "Seksi Materi tersedia tidak ada di Beranda.");
  assert(initial.hasExplore, "Seksi Jelajahi materi tidak ada di Beranda.");
  for (const heading of ["Materi disematkan", "Materi tersedia", "Jelajahi materi"]) {
    assert(
      initial.headings.includes(heading),
      `Judul seksi "${heading}" tidak ditemukan (${initial.headings.join(" | ")}).`
    );
  }
  assert(
    initial.ordered,
    "Urutan Beranda harus Materi disematkan → Materi tersedia → Jelajahi materi."
  );
  log("Beranda tampil dengan urutan Materi disematkan → Materi tersedia → Jelajahi materi.");

  const pinCount = await page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke("profile_get_active")
      .then((active) => window.__TAURI_INTERNALS__.invoke("pinned_list", { profileId: active.id }))
      .then((items) => items.length)
      .catch(() => -1)
  `);
  assert(pinCount === 0, `Sematan awal harus kosong, ditemukan ${pinCount}.`);

  await clickButton(page, "Jelajahi materi");
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`,
    { label: "katalog dari empty state Beranda" }
  );
  log("Empty state Materi disematkan membuka Jelajah Materi.");

  assert(await page.evaluate(fillSearch("zakat")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `[...document.querySelectorAll("[data-pin-toggle]")].some(
      (button) => button.getAttribute("aria-label") === "Sematkan Zakat dan Infak"
    )`,
    { label: "tombol sematkan pada kartu Zakat dan Infak" }
  );
  const toggleResult = await page.evaluate(zakatPinToggle);
  assert(toggleResult === "clicked", `Tombol sematkan tidak dapat diklik (${toggleResult}).`);
  await page.waitFor(
    `(() => {
      const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      return Boolean(button) && button.getAttribute("aria-pressed") === "true";
    })()`,
    { label: "status sematkan aktif di katalog" }
  );
  const pinnedToggle = await page.evaluate(zakatCardPinState);
  assert(
    pinnedToggle.label === "Disematkan" && pinnedToggle.pressed === "true",
    `Tombol sematkan tidak berubah menjadi Disematkan (${JSON.stringify(pinnedToggle)}).`
  );
  log("Tombol Sematkan di kartu katalog berubah menjadi Disematkan (aria-pressed=true).");
  await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      button?.scrollIntoView({ block: "center" });
      return true;
    })()
  `);
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot(path.join(artifactDir, "katalog-sematkan.png"));

  await clickButton(page, "Beranda");
  await waitForHome(page, "Beranda setelah menyematkan");
  await page.waitFor(`document.querySelector("[data-pinned-card]") !== null`, {
    label: "kartu sematan di Beranda"
  });
  const pinnedHome = await page.evaluate(homePinnedState);
  assert(pinnedHome.count === 1, `Beranda harus menampilkan 1 sematan, ditemukan ${pinnedHome.count}.`);
  assert(
    pinnedHome.title === "Zakat dan Infak",
    `Kartu sematan menampilkan "${pinnedHome.title}", seharusnya "Zakat dan Infak".`
  );
  assert(pinnedHome.thumbnailReady, "Thumbnail kartu sematan belum termuat.");
  assert(!pinnedHome.hasEmpty, "Empty state sematan masih tampil padahal ada sematan.");
  assert(pinnedHome.hasManage, "Tombol Kelola sematan tidak muncul saat ada sematan.");
  log("Materi yang disematkan muncul di Beranda dengan thumbnail dan tombol Kelola sematan.");
  await page.screenshot(path.join(artifactDir, "beranda-disematkan.png"));

  await page.send("Page.reload");
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri setelah muat ulang" }
  );
  await waitForHome(page, "Beranda setelah muat ulang");
  await page.waitFor(`document.querySelector("[data-pinned-card] h3")?.textContent.includes("Zakat dan Infak")`, {
    label: "sematan bertahan setelah muat ulang"
  });
  const persisted = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("profile_get_active").then((active) =>
      window.__TAURI_INTERNALS__.invoke("pinned_list", { profileId: active.id })
    )
  `);
  assert(
    Array.isArray(persisted) &&
      persisted.length === 1 &&
      persisted[0].lessonId === "zakat" &&
      persisted[0].packageId === "kelas2-pai-b06-zakat",
    `Sematan tersimpan tidak sesuai: ${JSON.stringify(persisted)}`
  );
  log("Sematan bertahan setelah muat ulang dan terbaca dari SQLite (profil aktif).");

  await clickButton(page, "Kelola sematan");
  await page.waitFor(
    `document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`,
    { label: "katalog dari Kelola sematan" }
  );
  assert(await page.evaluate(fillSearch("zakat")), "Input pencarian tidak ditemukan.");
  await page.waitFor(
    `(() => {
      const button = [...document.querySelectorAll("[data-pin-toggle]")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      return Boolean(button) && button.getAttribute("aria-pressed") === "true";
    })()`,
    { label: "status sematan terbaca ulang di katalog" }
  );
  log("Katalog memuat status sematan tersimpan (aria-pressed=true setelah buka ulang).");

  await clickButton(page, "Beranda");
  await waitForHome(page, "Beranda untuk melepas sematan");
  await page.waitFor(
    `document.querySelector('[data-pinned-card] button[aria-label="Lepas sematan Zakat dan Infak"]') !== null`,
    { label: "tombol Lepas pada kartu sematan" }
  );
  const unpin = await page.evaluate(`
    (() => {
      const button = [...document.querySelectorAll("button")].find(
        (node) => node.getAttribute("aria-label") === "Lepas sematan Zakat dan Infak"
      );
      if (!button) return "missing";
      if (button.disabled) return "disabled";
      button.click();
      return "clicked";
    })()
  `);
  assert(unpin === "clicked", `Tombol Lepas tidak dapat diklik (${unpin}).`);
  await page.waitFor(
    `document.querySelector("[data-pinned-empty]") !== null &&
     document.querySelector("[data-pinned-card]") === null`,
    { label: "empty state setelah melepas sematan" }
  );
  log("Tombol Lepas di Beranda mengembalikan seksi ke empty state.");

  await page.send("Page.reload");
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri setelah muat ulang kedua" }
  );
  await waitForHome(page, "Beranda setelah melepas sematan");
  await page.waitFor(
    `document.querySelector("[data-pinned-empty]") !== null &&
     document.querySelector("[data-pinned-card]") === null`,
    { label: "sematan tetap kosong setelah muat ulang" }
  );
  const afterUnpin = await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("profile_get_active").then((active) =>
      window.__TAURI_INTERNALS__.invoke("pinned_list", { profileId: active.id })
    )
  `);
  assert(
    Array.isArray(afterUnpin) && afterUnpin.length === 0,
    `Sematan harus kosong setelah dilepas, ditemukan ${JSON.stringify(afterUnpin)}.`
  );
  log("Pelepasan sematan tersimpan permanen (pinned_list kosong setelah muat ulang).");
  await page.screenshot(path.join(artifactDir, "beranda-tanpa-sematan.png"));
}
