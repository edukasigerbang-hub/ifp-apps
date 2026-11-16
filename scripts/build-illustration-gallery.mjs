import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/packages";
const OUT_DIR = "docs/galeri-aktivitas";
const OUT = join(OUT_DIR, "index.html");

const dirs = readdirSync(ROOT)
  .filter((d) => /^kelas\d-matematika-b0[1-8]-/.test(d))
  .sort((a, b) => a.localeCompare(b, "id"));

if (dirs.length !== 48) throw new Error(`harap 48 paket, dapat ${dirs.length}`);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const grades = new Map();
let total = 0;

for (const dir of dirs) {
  const activity = JSON.parse(readFileSync(join(ROOT, dir, "activities/activity-001.json"), "utf8"));
  const manifest = JSON.parse(readFileSync(join(ROOT, dir, "manifest.json"), "utf8"));
  const title = manifest.title ?? dir;
  const grade = Number(dir[5]);
  const steps = activity.interactionConfig?.steps ?? [];
  if (steps.length !== 5) throw new Error(`${dir}: ${steps.length} langkah`);
  const items = steps.map((s, i) => {
    const file = s.assetPath.replace(/^assets\//, "");
    const abs = join(ROOT, dir, "assets", file);
    if (!existsSync(abs)) throw new Error(`hilang: ${abs}`);
    total += 1;
    return { n: i + 1, src: `../../${ROOT}/${dir}/assets/${file}`, prompt: s.prompt, alt: s.altText };
  });
  if (!grades.has(grade)) grades.set(grade, []);
  grades.get(grade).push({ dir, title, items });
}

const sections = [...grades.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([grade, pkgs]) => {
    const cards = pkgs
      .map(
        (p) => `
    <section class="pkg">
      <h3>${esc(p.title)} <span class="dir">${esc(p.dir)}</span></h3>
      <ol class="steps">
${p.items
  .map(
    (s) => `        <li>
          <a href="${esc(s.src)}" target="_blank"><img loading="lazy" src="${esc(s.src)}" alt="${esc(s.alt)}"></a>
          <p class="prompt"><b>${s.n}.</b> ${esc(s.prompt)}</p>
          <p class="alt">${esc(s.alt)}</p>
        </li>`
  )
  .join("\n")}
      </ol>
    </section>`
      )
      .join("\n");
    return `<h2 id="kelas-${grade}">Kelas ${grade}</h2>${cards}`;
  })
  .join("\n");

const nav = [...grades.keys()]
  .sort((a, b) => a - b)
  .map((g) => `<a href="#kelas-${g}">Kelas ${g}</a>`)
  .join(" ");

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Galeri ilustrasi langkah — 48 paket matematika</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 24px; font: 14px/1.5 "Segoe UI", system-ui, sans-serif; background: #f4f7fa; color: #172a4a; }
  header { position: sticky; top: 0; z-index: 2; background: #f4f7facc; backdrop-filter: blur(6px); padding: 8px 0 12px; border-bottom: 1px solid #d7e0ea; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #4a5568; margin: 0 0 8px; }
  nav a { display: inline-block; padding: 4px 10px; margin: 2px 4px 2px 0; border-radius: 999px; background: #fff; border: 1px solid #cfdae6; color: #172a4a; text-decoration: none; }
  nav a:hover { background: #0d8a84; color: #fff; border-color: #0d8a84; }
  h2 { margin: 28px 0 10px; font-size: 17px; border-left: 5px solid #0d8a84; padding-left: 10px; }
  .pkg { background: #fff; border: 1px solid #dde5ee; border-radius: 12px; padding: 14px 16px; margin: 0 0 14px; }
  .pkg h3 { margin: 0 0 10px; font-size: 15px; }
  .dir { font: 11px/1 ui-monospace, monospace; color: #6b7280; font-weight: 400; margin-left: 6px; }
  ol.steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
  @media (max-width: 1100px) { ol.steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  ol.steps li { margin: 0; }
  ol.steps img { width: 100%; height: auto; border: 1px solid #d7e0ea; border-radius: 8px; background: #fff; display: block; }
  .prompt { margin: 6px 0 2px; font-size: 12px; }
  .alt { margin: 0; font-size: 11px; color: #5b6675; }
</style>
</head>
<body>
<header>
  <h1>Galeri ilustrasi per langkah — 48 paket matematika kelas 1–6</h1>
  <p class="meta">48 aktivitas × 5 langkah = <b>${total} gambar</b>. Klik gambar untuk ukuran penuh. Keterangan abu-abu = alt text yang dibacakan pembaca layar. Dibuat oleh <code>npm run content:gallery</code>.</p>
  <nav>${nav}</nav>
</header>
${sections}
</body>
</html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html, "utf8");
console.log(`galeri: ${OUT} · ${dirs.length} paket · ${total} gambar`);
