// Penulis berkas bundel untuk tab "Susun": index.html, assets/style.css, dan
// assets/app.js dihasilkan ulang secara deterministik dari naskah (sceneModel).
// Keluaran harus lolos pemindaian mandiri Rust: tanpa http(s)://, fetch(,
// window.open, atau WebSocket, dan tanpa CDN.
import {
  EFFECT_LABELS,
  SCENE_ELEMENT_ID,
  splitPoints,
  type Scene,
  type SceneStep,
  type TextBlock
} from "./sceneModel";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

export function escapeJsonForHtml(value: unknown): string {
  // `<` di-escape supaya teks seperti "</script>" tidak memutus blok JSON.
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function extractSceneDocument(html: string): unknown {
  const pattern = new RegExp(
    `<script type="application/json" id="${SCENE_ELEMENT_ID}">([\\s\\S]*?)</script>`
  );
  const match = html.match(pattern);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function textBlockHtml(block: TextBlock): string {
  const classes = [
    "block",
    "text",
    `text-${block.style}`,
    `tone-${block.tone}`,
    `size-${block.size}`,
    `align-${block.align}`,
    block.bold ? "is-bold" : "",
    block.italic ? "is-italic" : ""
  ].filter(Boolean);
  const className = classes.join(" ");
  if (block.style === "poin") {
    const items = splitPoints(block.text)
      .map((line) => `          <li>${escapeHtml(line)}</li>`)
      .join("\n");
    return `        <ul class="${className}">\n${items}\n        </ul>`;
  }
  if (block.style === "kutipan") {
    return `        <blockquote class="${className}">${escapeHtml(block.text)}</blockquote>`;
  }
  if (block.style === "catatan") {
    return `        <aside class="${className}" role="note">${escapeHtml(block.text)}</aside>`;
  }
  return `        <p class="${className}">${escapeHtml(block.text)}</p>`;
}

function imageBlockHtml(
  block: { path: string; alt: string; caption: string; layout: string },
  preview: boolean,
  assets: Record<string, string>
): string {
  const className = `block figure figure-${block.layout}`;
  const caption = block.caption.trim()
    ? `\n          <figcaption>${escapeHtml(block.caption)}</figcaption>`
    : "";
  if (preview) {
    const source = assets[block.path];
    const image = source
      ? `<img src="${escapeHtml(source)}" alt="${escapeHtml(block.alt)}" />`
      : `<div class="figure-placeholder">${escapeHtml(block.path || "gambar belum dipilih")}</div>`;
    return `        <figure class="${className}">${image}${caption}\n        </figure>`;
  }
  return `        <figure class="${className}">
          <img src="${escapeHtml(block.path)}" alt="${escapeHtml(block.alt)}" loading="lazy" />${caption}
        </figure>`;
}

function audioBlockHtml(
  block: { path: string; label: string; caption: string },
  preview: boolean
): string {
  const source = preview ? "" : ` src="${escapeHtml(block.path)}"`;
  const caption = block.caption.trim()
    ? `\n          <p class="audio-caption">${escapeHtml(block.caption)}</p>`
    : "";
  return `        <div class="block audio">
          <p class="audio-label">Suara: ${escapeHtml(block.label)}</p>
          <audio controls preload="metadata"${source}></audio>${caption}
        </div>`;
}

function stepHtml(
  step: SceneStep,
  index: number,
  preview: boolean,
  assets: Record<string, string>
): string {
  const blocks = step.blocks
    .map((block) => {
      if (block.kind === "teks") return textBlockHtml(block);
      if (block.kind === "gambar") return imageBlockHtml(block, preview, assets);
      return audioBlockHtml(block, preview);
    })
    .join("\n");
  const active = index === 0 ? ' data-active="true"' : "";
  return `      <article class="step" data-step="${index}" data-effect="${step.effect}" data-sound="${step.sound}"${active} aria-label="${escapeHtml(
    step.title
  )}">
        <h2 class="step-title">${escapeHtml(step.title)}</h2>
${blocks}
        <div class="fx" aria-hidden="true"></div>
      </article>`;
}

function documentShell(scene: Scene, inner: string, preview: boolean): string {
  const headline = scene.subtitle.trim()
    ? `\n      <p class="lede">${escapeHtml(scene.subtitle)}</p>`
    : "";
  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(scene.title)}</title>
${
  preview
    ? `    <style>\n${renderStyle()}\n    </style>`
    : `    <link rel="stylesheet" href="assets/style.css" />`
}
  </head>
  <body>
    <main id="material" class="material theme-${scene.theme}" data-stage="0" data-sound="${scene.steps[0]?.sound ?? "tak-ada"}">
      <header class="head">
        <p class="eyebrow">Materi Studio</p>
        <h1>${escapeHtml(scene.title)}</h1>${headline}
      </header>

      <section class="stage" id="stage" aria-live="polite">
${inner}
      </section>

      <div class="controls">
        <button type="button" id="previous" class="ghost">Sebelumnya</button>
        <button type="button" id="next">Berikutnya</button>
        <button type="button" id="complete" class="primary">Tandai selesai</button>
        <button type="button" id="exit" class="ghost">Keluar</button>
      </div>

      <p class="status" id="status" role="status" aria-live="polite">
        Langkah 1 dari ${scene.steps.length}.
      </p>
    </main>
${
  preview
    ? `    <script>\n${renderRuntime()}\n    </script>`
    : `    <script type="application/json" id="${SCENE_ELEMENT_ID}">${escapeJsonForHtml(scene)}</script>
    <script src="assets/app.js"></script>`
}
  </body>
</html>
`;
}

/** index.html final yang ditulis ke draft; memuat naskah untuk disunting lagi. */
export function renderIndexHtml(scene: Scene): string {
  const steps = scene.steps.map((step, index) => stepHtml(step, index, false, {})).join("\n");
  return documentShell(scene, steps, false);
}

/**
 * Dokumen pratinjau di dalam iframe. `assets` memetakan path gambar ke data URL
 * supaya pratinjau menampilkan gambar asli dari draft.
 */
export function renderPreviewDocument(scene: Scene, assets: Record<string, string> = {}): string {
  const steps = scene.steps.map((step, index) => stepHtml(step, index, true, assets)).join("\n");
  return documentShell(scene, steps, true);
}

/** Teks alternatif berkas suara (kontrak §4 mewajibkan captionsPath bila hasAudio). */
export function renderCaptions(scene: Scene): string | null {
  const clips = scene.steps
    .flatMap((step) => step.blocks)
    .filter((block) => block.kind === "suara" && block.path.length > 0);
  if (clips.length === 0) {
    return null;
  }
  const stamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${rest.toFixed(3).padStart(6, "0")}`;
  };
  const lines = [
    "WEBVTT",
    "",
    "NOTE Teks alternatif blok suara, dibuat dari naskah Susun.",
    "NOTE Waktu perkiraan 10 detik per klip; sesuaikan bila durasi sebenarnya berbeda.",
    ""
  ];
  clips.forEach((clip, index) => {
    const label = clip.kind === "suara" ? clip.label.trim() || "Suara" : "Suara";
    const caption = clip.kind === "suara" && clip.caption.trim() ? ` — ${clip.caption.trim()}` : "";
    lines.push(`${stamp(index * 10)} --> ${stamp(index * 10 + 10)}`, `${label}${caption}`, "");
  });
  return lines.join("\n");
}

const THEME_CSS = `.theme-cerah{--bg:#fffdf8;--ink:#12313a;--accent:#0f766e;--soft:#e8f4f0;--line:#cfe3dd}
.theme-tenang{--bg:#f6f8fb;--ink:#1b2a41;--accent:#3f6ea8;--soft:#e6eef8;--line:#ccdaea}
.theme-petualangan{--bg:#fff8ec;--ink:#3b2415;--accent:#b45309;--soft:#fdeccd;--line:#f0d6a8}`;

export function renderStyle(): string {
  return `:root{color-scheme:light}
${THEME_CSS}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,"Segoe UI",sans-serif;line-height:1.6}
.material{max-width:820px;margin:0 auto;padding:28px 22px 44px}
.eyebrow{margin:0 0 6px;color:var(--accent);font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
h1{margin:0 0 10px;font-size:clamp(24px,4vw,36px);line-height:1.2}
.lede{margin:0;font-size:17px;color:var(--ink)}
.stage{margin-top:24px}
.step{position:relative;display:none;padding:22px;border:1px solid var(--line);border-radius:20px;background:#fff;overflow:hidden}
.step[data-active="true"]{display:block}
.step-title{margin:0 0 14px;font-size:20px;color:var(--accent)}
.block{margin:0 0 14px}
.block:last-child{margin-bottom:0}
.text-paragraf{font-size:17px}
.text-catatan{padding:12px 14px;border-left:4px solid var(--accent);border-radius:10px;background:var(--soft);font-size:15px}
.text-kutipan{margin:0 0 14px;padding:6px 0 6px 16px;border-left:3px solid var(--accent);font-style:italic;font-size:18px}
.text-poin{margin:0 0 14px;padding-left:22px}
.text-poin li{margin:4px 0}
.tone-aksen{color:var(--accent)}
.tone-lembut{color:#55707a}
.size-kecil{font-size:15px}
.size-besar{font-size:20px}
.align-tengah{text-align:center}
.align-kanan{text-align:right}
.is-bold{font-weight:700}
.is-italic{font-style:italic}
.figure-kiri,.figure-kanan{margin:0 0 16px}
@media (min-width:600px){
.figure-kiri{float:left;width:46%;margin:0 18px 12px 0}
.figure-kanan{float:right;width:46%;margin:0 0 12px 18px}
}
.audio{padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--soft)}
.audio-label{margin:0 0 8px;font-size:13px;font-weight:600;color:var(--accent)}
.audio audio{width:100%}
.audio-caption{margin:8px 0 0;font-size:13px;color:#55707a}
.figure{margin:0 0 16px}
.figure img{display:block;width:100%;height:auto;border-radius:14px;border:1px solid var(--line)}
.figure figcaption{margin-top:6px;font-size:13px;color:#55707a}
.figure-placeholder{display:flex;align-items:center;justify-content:center;min-height:150px;border:2px dashed var(--line);border-radius:14px;background:var(--soft);font-size:13px;color:#55707a}
.fx{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.step[data-effect="kilau"][data-active="true"] .fx::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.75) 50%,transparent 65%);transform:translateX(-120%);animation:kilau 1100ms ease-out}
@keyframes kilau{to{transform:translateX(120%)}}
.step[data-effect="getar"][data-active="true"]{animation:getar 420ms ease-in-out}
@keyframes getar{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
.fx-piece{position:absolute;top:-16px;width:10px;height:10px;border-radius:2px;animation:jatuh 1400ms ease-in forwards}
@keyframes jatuh{to{transform:translate3d(var(--drift),110vh,0) rotate(540deg);opacity:.2}}
.fx-letter{position:absolute;top:-28px;font-weight:700;font-size:22px;color:var(--accent);animation:jatuh 1600ms linear forwards}
.controls{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
button{min-height:44px;padding:0 18px;border-radius:12px;border:1px solid var(--accent);background:var(--accent);color:#fff;font:inherit;font-weight:600;cursor:pointer}
button.ghost{background:transparent;color:var(--accent)}
button.primary{box-shadow:0 2px 0 rgba(0,0,0,.08)}
button:disabled{opacity:.45;cursor:default}
.status{margin-top:14px;font-size:14px;color:#55707a}
.reduced-motion .step,.reduced-motion .fx-piece,.reduced-motion .fx-letter{animation:none!important}
.reduced-motion .fx::after{display:none}
@media (prefers-reduced-motion: reduce){
.step,.fx-piece,.fx-letter{animation:none!important}
.fx::after{display:none}
}
@media (max-width:520px){.material{padding:20px 14px 36px}.step{padding:16px}}`;
}

/** Runtime iframe: protokol `ifp` yang sama dengan kerangka bawaan aplikasi. */
export function renderRuntime(): string {
  return `(function () {
  "use strict";

  var stage = document.getElementById("material");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var statusText = document.getElementById("status");
  var previousButton = document.getElementById("previous");
  var nextButton = document.getElementById("next");
  var completeButton = document.getElementById("complete");
  var exitButton = document.getElementById("exit");

  var index = 0;
  var completed = false;
  var configured = false;
  var reduced = false;
  var announceTimer = null;
  var announceCount = 0;
  var audio = null;

  function post(type, body) {
    window.parent.postMessage(Object.assign({ ifp: 1, type: type }, body || {}), "*");
  }

  function announce() {
    post("ready");
    post("progress", { value: (index + 1) / steps.length });
  }

  function stopAnnouncing() {
    if (announceTimer !== null) {
      window.clearInterval(announceTimer);
      announceTimer = null;
    }
  }

  function startAnnouncing() {
    stopAnnouncing();
    announceCount = 0;
    announce();
    announceTimer = window.setInterval(function () {
      if (configured) {
        stopAnnouncing();
        return;
      }
      announceCount += 1;
      if (announceCount > 25) {
        stopAnnouncing();
        return;
      }
      announce();
    }, 400);
  }

  // Suara dibuat lewat WebAudio: tidak ada berkas audio, tidak ada CDN.
  function context() {
    if (audio) {
      return audio;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    audio = new Ctor();
    return audio;
  }

  function tone(ctx, from, to, duration, type, volume) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  function noise(ctx, duration, volume, cutoff) {
    var frames = Math.floor(ctx.sampleRate * duration);
    var buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < frames; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    var gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  }

  function playSound(name) {
    if (reduced || name === "tak-ada" || !audio || audio.state !== "running") {
      return;
    }
    var ctx = audio;
    if (name === "bel") {
      tone(ctx, 880, 1320, 0.28, "sine", 0.18);
      window.setTimeout(function () {
        tone(ctx, 1320, 1760, 0.22, "sine", 0.12);
      }, 130);
    } else if (name === "klik") {
      tone(ctx, 420, 260, 0.08, "square", 0.1);
    } else if (name === "whoosh") {
      tone(ctx, 720, 120, 0.35, "sawtooth", 0.08);
    } else if (name === "tepuk") {
      noise(ctx, 0.18, 0.35, 2200);
    }
  }

  function clearEffects(element) {
    var layer = element.querySelector(".fx");
    if (layer) {
      layer.textContent = "";
    }
  }

  function confetti(element) {
    var layer = element.querySelector(".fx");
    if (!layer) {
      return;
    }
    var colors = ["#0f766e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];
    for (var i = 0; i < 18; i += 1) {
      var piece = document.createElement("span");
      piece.className = "fx-piece";
      piece.style.left = 6 + Math.random() * 88 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty("--drift", (Math.random() * 120 - 60).toFixed(0) + "px");
      piece.style.animationDelay = (Math.random() * 220).toFixed(0) + "ms";
      layer.appendChild(piece);
    }
  }

  function letterRain(element, title) {
    var layer = element.querySelector(".fx");
    if (!layer) {
      return;
    }
    var letters = title.replace(/\\s+/g, " ").slice(0, 24);
    for (var i = 0; i < letters.length; i += 1) {
      if (letters.charAt(i) === " ") {
        continue;
      }
      var letter = document.createElement("span");
      letter.className = "fx-letter";
      letter.textContent = letters.charAt(i);
      letter.style.left = 4 + Math.random() * 90 + "%";
      letter.style.setProperty("--drift", (Math.random() * 60 - 30).toFixed(0) + "px");
      letter.style.animationDelay = (i * 45).toFixed(0) + "ms";
      layer.appendChild(letter);
    }
  }

  function show(nextIndex) {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    stage.setAttribute("data-stage", String(index));
    steps.forEach(function (item, position) {
      if (position === index) {
        item.setAttribute("data-active", "true");
      } else {
        item.removeAttribute("data-active");
        clearEffects(item);
      }
    });
    var current = steps[index];
    if (current) {
      var effect = current.getAttribute("data-effect");
      clearEffects(current);
      if (!reduced && effect === "konfeti") {
        confetti(current);
      }
      if (!reduced && effect === "hujan-huruf") {
        var heading = current.querySelector(".step-title");
        letterRain(current, heading ? heading.textContent || "" : "");
      }
      playSound(current.getAttribute("data-sound") || "tak-ada");
    }
    previousButton.disabled = index === 0;
    nextButton.disabled = index === steps.length - 1;
    statusText.textContent = "Langkah " + (index + 1) + " dari " + steps.length + ".";
    post("progress", { value: (index + 1) / steps.length });
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.ifp !== 1) {
      return;
    }
    if (data.type === "config") {
      configured = true;
      reduced = Boolean(data.reducedMotion);
      stage.classList.toggle("reduced-motion", reduced);
      stopAnnouncing();
      return;
    }
    if (data.type === "hello") {
      announce();
    }
  });

  // Autoplay browser mengunci audio sampai ada gerakan pengguna.
  function unlock() {
    var ctx = context();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  }
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  previousButton.addEventListener("click", function () {
    show(index - 1);
  });
  nextButton.addEventListener("click", function () {
    show(index + 1);
  });
  completeButton.addEventListener("click", function () {
    if (completed) {
      return;
    }
    completed = true;
    completeButton.disabled = true;
    completeButton.textContent = "Sudah selesai";
    statusText.textContent = "Materi ditandai selesai.";
    post("complete", { value: 1 });
  });
  exitButton.addEventListener("click", function () {
    post("request-exit");
  });
  window.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      show(index - 1);
    } else if (event.key === "Home") {
      show(0);
    } else if (event.key === "End") {
      show(steps.length - 1);
    }
  });

  show(0);
  startAnnouncing();
})();
`;
}

export const SCENE_FILES = {
  entry: "index.html",
  style: "assets/style.css",
  runtime: "assets/app.js"
} as const;

export function renderSceneFiles(scene: Scene): {
  entry: string;
  style: string;
  runtime: string;
  captions: string | null;
  summary: string;
} {
  return {
    entry: renderIndexHtml(scene),
    style: renderStyle(),
    runtime: renderRuntime(),
    captions: renderCaptions(scene),
    summary: `${scene.steps.length} langkah · tema ${scene.theme} · ${scene.steps
      .map((step) => EFFECT_LABELS[step.effect])
      .filter((label) => label !== "Tanpa efek")
      .length} langkah berefek`
  };
}
