import path from "node:path";

function auditInPage() {
  const issues = [];
  const add = (rule, severity, message, element) => {
    let selector = element?.tagName?.toLowerCase() ?? "document";
    if (element?.id) {
      selector += `#${element.id}`;
    } else if (element?.className && typeof element.className === "string") {
      const first = element.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".");
      if (first) selector += `.${first}`;
    }
    issues.push({ rule, severity, message, selector });
  };

  const isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return (
      rect.width > 1 &&
      rect.height > 1 &&
      style.visibility !== "hidden" &&
      style.display !== "none"
    );
  };

  const textOf = (element) =>
    (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();

  const accessibleName = (element) => {
    const aria = element.getAttribute("aria-label");
    if (aria && aria.trim()) return aria.trim();
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map(textOf)
        .join(" ")
        .trim();
      if (text) return text;
    }
    if (element.id) {
      const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (label) return textOf(label);
    }
    const wrapping = element.closest("label");
    if (wrapping) return textOf(wrapping);
    if (element.tagName === "IMG") return element.getAttribute("alt") || "";
    if (element.tagName === "INPUT") {
      const value = element.getAttribute("value");
      if (
        (element.type === "submit" || element.type === "button" || element.type === "reset") &&
        value
      ) {
        return value;
      }
    }
    return textOf(element) || element.getAttribute("title") || "";
  };

  const interactiveSelector =
    "a[href], button, input:not([type='hidden']), select, textarea, [role='button'], [role='tab'], [role='switch']";
  const interactive = [...document.querySelectorAll(interactiveSelector)].filter(isVisible);

  for (const element of interactive) {
    if (element.disabled) continue;
    if (!accessibleName(element)) {
      add("name", "error", "Elemen interaktif tanpa nama aksesibel.", element);
    }
    if (element.tagName === "BUTTON" && !element.hasAttribute("type")) {
      add("button-type", "warning", "Tombol tanpa atribut type.", element);
    }
  }

  for (const image of document.querySelectorAll("img")) {
    if (!image.hasAttribute("alt")) {
      add("img-alt", "error", "Gambar tanpa atribut alt.", image);
    }
  }

  const seenIds = new Map();
  for (const element of document.querySelectorAll("[id]")) {
    const id = element.id;
    if (!id) continue;
    seenIds.set(id, (seenIds.get(id) ?? 0) + 1);
  }
  for (const [id, count] of seenIds) {
    if (count > 1) {
      add("duplicate-id", "error", `ID "${id}" muncul ${count} kali.`, document.getElementById(id));
    }
  }

  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(isVisible);
  const h1Count = headings.filter((heading) => heading.tagName === "H1").length;
  if (h1Count !== 1) {
    add("heading-h1", "error", `Jumlah <h1> harus 1, ditemukan ${h1Count}.`, document.querySelector("main"));
  }
  let previousLevel = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    if (previousLevel > 0 && level > previousLevel + 1) {
      add(
        "heading-order",
        "error",
        `Lompatan heading h${previousLevel} → h${level}: "${textOf(heading)}".`,
        heading
      );
    }
    previousLevel = level;
  }

  const mains = [...document.querySelectorAll("main")].filter(isVisible);
  if (mains.length !== 1) {
    add("landmark-main", "error", `Landmark <main> harus 1, ditemukan ${mains.length}.`);
  }
  for (const nav of document.querySelectorAll("nav")) {
    if (!nav.getAttribute("aria-label") && !nav.getAttribute("aria-labelledby")) {
      add("landmark-nav", "warning", "Elemen <nav> tanpa nama aksesibel.", nav);
    }
  }

  const tablists = [...document.querySelectorAll("[role='tablist']")];
  for (const tablist of tablists) {
    const tabs = [...tablist.querySelectorAll("[role='tab']")];
    for (const tab of tabs) {
      const controls = tab.getAttribute("aria-controls");
      if (!controls || !document.getElementById(controls)) {
        add(
          "tab-controls",
          "warning",
          "Tab tanpa aria-controls yang menunjuk panel valid.",
          tab
        );
      }
    }
  }

  const parseColor = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
    if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  };

  const blend = (top, bottom) => {
    const alpha = top[3];
    return [
      top[0] * alpha + bottom[0] * (1 - alpha),
      top[1] * alpha + bottom[1] * (1 - alpha),
      top[2] * alpha + bottom[2] * (1 - alpha),
      1
    ];
  };

  const luminance = (rgb) => {
    const channel = (value) => {
      const scaled = value / 255;
      return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  };

  const backgroundOf = (element) => {
    const layers = [];
    let node = element;
    while (node && layers.length < 20) {
      const style = getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage !== "none") {
        return null;
      }
      const color = parseColor(style.backgroundColor);
      if (color && color[3] > 0) {
        layers.push(color);
        if (color[3] >= 1) break;
      }
      node = node.parentElement;
    }
    let background = [255, 255, 255, 1];
    for (const layer of layers.reverse()) {
      background = blend(layer, background);
    }
    return background;
  };

  const textCandidates = [
    ...document.querySelectorAll(
      "p, span, li, dt, dd, label, button, a[href], h1, h2, h3, h4, h5, h6, legend, td, th"
    )
  ].filter(isVisible);

  const contrastSeen = new Set();
  let contrastChecked = 0;
  for (const element of textCandidates) {
    if (!textOf(element)) continue;
    if (element.closest("[aria-hidden='true']")) continue;
    const style = getComputedStyle(element);
    const foreground = parseColor(style.color);
    if (!foreground || foreground[3] === 0) continue;
    const background = backgroundOf(element);
    if (!background) continue;
    const composed = foreground[3] < 1 ? blend(foreground, background) : foreground;
    const light = Math.max(luminance(composed), luminance(background));
    const dark = Math.min(luminance(composed), luminance(background));
    const ratio = (light + 0.05) / (dark + 0.05);
    const size = Number.parseFloat(style.fontSize) || 16;
    const weight = Number.parseInt(style.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const threshold = large ? 3 : 4.5;
    contrastChecked += 1;
    if (ratio + 0.01 < threshold) {
      const key = `${element.tagName}|${textOf(element).slice(0, 24)}|${ratio.toFixed(2)}`;
      if (contrastSeen.has(key)) continue;
      contrastSeen.add(key);
      add(
        "contrast",
        ratio < 3 ? "error" : "warning",
        `Kontras ${ratio.toFixed(2)}:1 (butuh ${threshold}:1) pada "${textOf(element).slice(0, 40)}".`,
        element
      );
    }
  }

  return {
    issues,
    stats: {
      interactive: interactive.length,
      headings: headings.length,
      images: document.querySelectorAll("img").length,
      contrastChecked,
      h1Count
    }
  };
}

function focusTrailInPage() {
  const element = document.activeElement;
  if (!element || element === document.body) return null;
  const text = (element.innerText || element.getAttribute("aria-label") || element.getAttribute("alt") || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  const style = getComputedStyle(element);
  return {
    tag: element.tagName.toLowerCase(),
    text,
    role: element.getAttribute("role"),
    outlineStyle: style.outlineStyle,
    outlineWidth: style.outlineWidth,
    boxShadow: style.boxShadow
  };
}

const SCREENS = [
  {
    label: "Beranda",
    wait: `document.querySelector("main h1")?.textContent.includes("Halo")`
  },
  {
    label: "Jelajah Materi",
    wait: `document.querySelector("main h1")?.textContent.includes("Jelajah Materi")`
  },
  { label: "Aktivitas Interaktif", wait: `document.body.textContent.includes("Aktivitas Interaktif")` },
  {
    label: "Player Pembelajaran",
    wait: `document.body.textContent.includes("Tujuan pembelajaran") || document.body.textContent.includes("Belum ada paket konten")`
  },
  { label: "Hasil Belajar", wait: `document.body.textContent.includes("Aktivitas terbaru")` },
  { label: "Konten & Pembaruan", wait: `document.body.textContent.includes("Paket terpasang")` },
  { label: "Lisensi Perangkat", wait: `document.body.textContent.includes("Status lisensi")` },
  { label: "Pengaturan", wait: `document.body.textContent.includes("Profil")` }
];

async function clickNav(page, label) {
  const clicked = await page.evaluate(`
    (() => {
      const candidates = [...document.querySelectorAll("button")]
        .filter((button) => button.textContent.trim() === ${JSON.stringify(label)});
      const visible = candidates.find((button) => button.offsetParent !== null) ?? candidates[0];
      if (!visible) return false;
      visible.click();
      return true;
    })()
  `);
  if (!clicked) {
    throw new Error(`Navigasi "${label}" tidak ditemukan.`);
  }
}

async function pressTab(page) {
  await page.send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9
  });
  await page.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9
  });
}

function touchTargetsInPage() {
  const issues = [];
  const add = (rule, severity, message, element) => {
    issues.push({
      rule,
      severity,
      message,
      selector: element?.tagName?.toLowerCase() ?? "document"
    });
  };
  const isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none";
  };
  const selector =
    "button, a[href], input:not([type='hidden']), select, textarea";
  for (const element of document.querySelectorAll(selector)) {
    if (!isVisible(element) || element.disabled) continue;
    const isChoice =
      element.tagName === "INPUT" &&
      (element.type === "radio" || element.type === "checkbox");
    const box = (isChoice ? element.closest("label") : element)?.getBoundingClientRect();
    if (!box) continue;
    const label =
      (element.innerText || element.getAttribute("aria-label") || element.getAttribute("placeholder") || element.tagName)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 40);
    if (box.height < 24) {
      add("touch-target", "error", `Target sentuh ${Math.round(box.height)}px: "${label}".`, element);
    } else if (box.height < 44) {
      add("touch-target", "warning", `Target sentuh ${Math.round(box.height)}px (<44): "${label}".`, element);
    }
  }
  return issues;
}

async function clickLabel(page, label) {
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
  if (result !== "clicked") {
    throw new Error(`Tombol "${label}" tidak dapat diklik (${result}).`);
  }
}

async function setViewport(page, width, height = 900) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise((resolve) => setTimeout(resolve, 250));
}

async function clearViewport(page) {
  await page.send("Emulation.clearDeviceMetricsOverride");
  await new Promise((resolve) => setTimeout(resolve, 250));
}

async function horizontalOverflow(page) {
  return page.evaluate(`
    ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    })
  `);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );
  await page.waitFor(`document.body.textContent.includes("Jelajah Materi")`, {
    label: "navigasi aplikasi"
  });

  const report = { screens: [], generatedAt: new Date().toISOString() };
  let errorCount = 0;
  let warningCount = 0;

  for (const screen of SCREENS) {
    await clickNav(page, screen.label);
    await page.waitFor(screen.wait, { label: `layar ${screen.label}` });
    await new Promise((resolve) => setTimeout(resolve, 250));

    const result = await page.evaluate(`(${auditInPage.toString()})()`);
    const errors = result.issues.filter((issue) => issue.severity === "error");
    const warnings = result.issues.filter((issue) => issue.severity === "warning");
    errorCount += errors.length;
    warningCount += warnings.length;
    report.screens.push({ screen: screen.label, stats: result.stats, issues: result.issues });
    log(
      `${screen.label}: ${result.stats.interactive} interaktif, ${result.stats.headings} heading, ` +
        `${result.stats.contrastChecked} kontras — ${errors.length} error, ${warnings.length} warning`
    );
  }

  await clickNav(page, "Pengaturan");
  await page.waitFor(`document.body.textContent.includes("Profil")`, { label: "Pengaturan" });
  await page.evaluate(`document.activeElement?.blur()`);
  await pressTab(page);
  const firstFocus = await page.evaluate(`(${focusTrailInPage.toString()})()`);
  if (!firstFocus || firstFocus.text !== "Lewati ke konten utama") {
    errorCount += 1;
    report.screens.push({
      screen: "Keyboard",
      stats: {},
      issues: [
        {
          rule: "skip-link",
          severity: "error",
          message: `Fokus pertama bukan tautan lewati: ${JSON.stringify(firstFocus)}`,
          selector: "a[href='#main-content']"
        }
      ]
    });
  } else {
    log("Tab pertama memfokuskan tautan “Lewati ke konten utama”.");
  }

  const trail = [];
  for (let index = 0; index < 10; index += 1) {
    await pressTab(page);
    const focused = await page.evaluate(`(${focusTrailInPage.toString()})()`);
    if (!focused) {
      errorCount += 1;
      trail.push({ step: index + 2, focused: null });
      break;
    }
    trail.push({ step: index + 2, ...focused });
    if (!focused.text && !focused.role) {
      errorCount += 1;
    }
  }
  const missingOutline = trail.filter(
    (step) => step.outlineStyle === "none" && step.boxShadow === "none"
  );
  if (missingOutline.length > 0) {
    warningCount += missingOutline.length;
    report.screens.push({
      screen: "Keyboard",
      stats: { steps: trail.length },
      issues: missingOutline.map((step) => ({
        rule: "focus-visible",
        severity: "warning",
        message: `Fokus tanpa indikator terlihat pada <${step.tag}> "${step.text}".`,
        selector: step.tag
      }))
    });
  }
  report.keyboardTrail = trail;
  log(
    `Traversal Tab: ${trail.filter((step) => step.text).length}/10 elemen bernama; ` +
      `${missingOutline.length} tanpa outline.`
  );

  const responsiveIssues = [];
  for (const screen of SCREENS) {
    await clickNav(page, screen.label);
    await page.waitFor(screen.wait, { label: `layar ${screen.label}` });
    for (const width of [640, 320]) {
      await setViewport(page, width);
      const overflow = await horizontalOverflow(page);
      if (overflow.scrollWidth > overflow.clientWidth + 1) {
        responsiveIssues.push({
          screen: screen.label,
          rule: "reflow",
          severity: "error",
          message: `Overflow horizontal pada ${width}px: ${overflow.scrollWidth} > ${overflow.clientWidth}.`,
          selector: "html"
        });
      }
    }
    await setViewport(page, 1600, 900);
    const targets = await page.evaluate(`(${touchTargetsInPage.toString()})()`);
    for (const issue of targets) {
      responsiveIssues.push({ screen: screen.label, ...issue });
    }
  }
  const responsiveErrors = responsiveIssues.filter((issue) => issue.severity === "error").length;
  const responsiveWarnings = responsiveIssues.filter(
    (issue) => issue.severity === "warning"
  ).length;
  errorCount += responsiveErrors;
  warningCount += responsiveWarnings;
  report.screens.push({
    screen: "Reflow 640/320 + target sentuh",
    stats: { widths: [640, 320] },
    issues: responsiveIssues
  });
  log(
    `Reflow 640/320 & target sentuh: ${responsiveErrors} error, ${responsiveWarnings} warning.`
  );

  await clickNav(page, "Pengaturan");
  await page.waitFor(`document.body.textContent.includes("Profil")`, { label: "Pengaturan" });
  await page.evaluate(`document.documentElement.style.fontSize = "200%"`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  const scaledOverflow = await horizontalOverflow(page);
  await page.evaluate(`document.documentElement.style.fontSize = ""`);
  const scaleIssues = [];
  if (scaledOverflow.scrollWidth > scaledOverflow.clientWidth + 1) {
    scaleIssues.push({
      rule: "text-scale",
      severity: "error",
      message: `Overflow horizontal pada teks 200%: ${scaledOverflow.scrollWidth} > ${scaledOverflow.clientWidth}.`,
      selector: "html"
    });
    errorCount += 1;
  }
  report.screens.push({ screen: "Teks 200%", stats: { width: 1600 }, issues: scaleIssues });
  log(`Teks 200%: ${scaleIssues.length === 0 ? "tanpa overflow" : "overflow terdeteksi"}.`);
  await clearViewport(page);

  const filled = await page.evaluate(`
    (() => {
      const input = document.querySelector('input[placeholder="Nama siswa atau guru"]');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(input, "A11y Uji");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()
  `);
  if (!filled) {
    throw new Error("Input nama profil untuk audit state dinamis tidak ditemukan.");
  }
  await clickLabel(page, "Tambah profil");
  await page.waitFor(`document.body.textContent.includes('Profil "A11y Uji" dibuat')`, {
    label: "profil uji dibuat"
  });
  const opened = await page.evaluate(`
    (() => {
      const row = [...document.querySelectorAll("li")]
        .find((item) => item.textContent.includes("A11y Uji"));
      if (!row) return "row-missing";
      const button = [...row.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === "Hapus");
      if (!button) return "button-missing";
      if (button.disabled) return "disabled";
      button.click();
      return "clicked";
    })()
  `);
  if (opened !== "clicked") {
    throw new Error(`Panel konfirmasi hapus tidak dapat dibuka (${opened}).`);
  }
  await page.waitFor(
    `document.body.textContent.includes('Hapus profil "A11y Uji"?')`,
    { label: "panel konfirmasi" }
  );
  const dynamicAudit = await page.evaluate(`(${auditInPage.toString()})()`);
  const dynamicErrors = dynamicAudit.issues.filter((issue) => issue.severity === "error");
  const dynamicWarnings = dynamicAudit.issues.filter(
    (issue) => issue.severity === "warning"
  );
  errorCount += dynamicErrors.length;
  warningCount += dynamicWarnings.length;
  report.screens.push({
    screen: "Pengaturan (konfirmasi hapus)",
    stats: dynamicAudit.stats,
    issues: dynamicAudit.issues
  });
  log(
    `State dinamis konfirmasi hapus: ${dynamicErrors.length} error, ${dynamicWarnings.length} warning.`
  );
  await page.screenshot(path.join(artifactDir, "a11y-dynamic.png"));
  await page.evaluate(`
    (() => {
      const row = [...document.querySelectorAll("li")]
        .find((item) => item.textContent.includes("A11y Uji"));
      const button = [...row.querySelectorAll("button")]
        .find((item) => item.textContent.trim() === "Batal");
      button?.click();
    })()
  `);

  const { writeFile } = await import("node:fs/promises");
  const reportPath = `${artifactDir}/a11y-report.json`;
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  log(`Laporan: ${reportPath}`);

  if (errorCount > 0) {
    const details = report.screens
      .flatMap((entry) =>
        entry.issues
          .filter((issue) => issue.severity === "error")
          .map((issue) => `[${entry.screen}] ${issue.rule}: ${issue.message} (${issue.selector})`)
      )
      .join("\n");
    throw new Error(`${errorCount} error aksesibilitas:\n${details}`);
  }
  log(`Audit selesai tanpa error (${warningCount} warning).`);
}
