import { describe, expect, it } from "vitest";
import {
  createImageBlock,
  createScene,
  createStep,
  createTextBlock,
  parseScene,
  sceneIssues,
  splitPoints,
  type Scene
} from "./sceneModel";
import {
  extractSceneDocument,
  renderIndexHtml,
  renderPreviewDocument,
  renderRuntime,
  renderSceneFiles,
  renderStyle
} from "./sceneRender";

const EXTERNAL_PATTERNS = [/https?:\/\//i, /fetch\(/i, /window\.open/i, /xmlhttprequest/i, /new websocket/i];

function sampleScene(): Scene {
  const scene = createScene("Siklus Air", "Perjalanan setetes air");
  scene.steps = [
    {
      ...createStep(0),
      id: "langkah-a",
      title: "Air naik",
      effect: "kilau",
      sound: "bel",
      blocks: [
        { ...createTextBlock("paragraf", "Matahari memanaskan air laut."), id: "teks-a" },
        { ...createImageBlock("assets/naik.webp"), id: "gambar-a", alt: "Uap air naik", caption: "Penguapan" }
      ]
    },
    {
      ...createStep(1),
      id: "langkah-b",
      title: "Hujan turun",
      effect: "konfeti",
      sound: "whoosh",
      blocks: [createTextBlock("poin", "Awan dingin\nTitik air jatuh")]
    }
  ];
  return scene;
}

describe("naskah visual", () => {
  it("dapat ditulis lalu dibaca kembali tanpa kehilangan isi", () => {
    const scene = sampleScene();
    const html = renderIndexHtml(scene);
    const parsed = parseScene(extractSceneDocument(html));

    expect(parsed).not.toBeNull();
    expect(parsed?.title).toBe("Siklus Air");
    expect(parsed?.steps.map((step) => step.title)).toEqual(["Air naik", "Hujan turun"]);
    expect(parsed?.steps[0].blocks[1]).toMatchObject({
      kind: "gambar",
      path: "assets/naik.webp",
      alt: "Uap air naik"
    });
    expect(parsed?.steps[1].blocks[0]).toMatchObject({ style: "poin", text: "Awan dingin\nTitik air jatuh" });
  });

  it("teks berbahaya tidak memutus blok JSON maupun markup", () => {
    const scene = createScene("Uji <teks>", "");
    scene.steps[0].blocks = [createTextBlock("paragraf", '</script><img src=x onerror="alert(1)">')];
    const html = renderIndexHtml(scene);

    expect(html).not.toContain("</script><img");
    expect(html).toContain("&lt;img src=x");
    const parsed = parseScene(extractSceneDocument(html));
    expect(parsed?.steps[0].blocks[0]).toMatchObject({
      text: '</script><img src=x onerror="alert(1)">'
    });
  });

  it("berkas hasil susunan tidak memuat rujukan eksternal", () => {
    const files = renderSceneFiles(sampleScene());
    for (const [name, content] of Object.entries({
      "index.html": files.entry,
      "assets/style.css": files.style,
      "assets/app.js": files.runtime
    })) {
      for (const pattern of EXTERNAL_PATTERNS) {
        expect({ name, problem: pattern.test(content) }).toEqual({ name, problem: false });
      }
    }
  });

  it("gambar memakai path aset dan teks alternatif", () => {
    const html = renderIndexHtml(sampleScene());
    expect(html).toContain('src="assets/naik.webp"');
    expect(html).toContain('alt="Uap air naik"');
    expect(html).toContain("<figcaption>Penguapan</figcaption>");
  });

  it("pratinjau memakai CSS sebaris dan placeholder gambar", () => {
    const preview = renderPreviewDocument(sampleScene());
    expect(preview).toContain("<style>");
    expect(preview).not.toContain('rel="stylesheet"');
    expect(preview).toContain("figure-placeholder");
    expect(preview).toContain("assets/naik.webp");
  });

  it("runtime memuat protokol iframe yang dipakai penampil", () => {
    const runtime = renderRuntime();
    for (const token of ['post("ready")', 'post("progress"', 'post("complete"', 'post("request-exit"', 'data.type === "config"']) {
      expect(runtime).toContain(token);
    }
    expect(renderStyle()).toContain("prefers-reduced-motion");
  });
});

describe("validasi naskah", () => {
  it("menerima naskah lengkap", () => {
    expect(sceneIssues(sampleScene(), ["assets/naik.webp"])).toEqual([]);
  });

  it("menandai gambar yang hilang dan teks alternatif kosong", () => {
    const scene = createScene("Materi Uji", "");
    scene.steps[0].blocks = [createImageBlock("assets/hilang.webp")];
    const issues = sceneIssues(scene, ["assets/naik.webp"]);
    expect(issues.join(" ")).toContain("tidak ada di draft");
    expect(issues.join(" ")).toContain("teks alternatif");
  });

  it("menolak teks kosong dan alamat web di dalam teks", () => {
    const scene = createScene("Materi Uji", "");
    scene.steps[0].blocks = [createTextBlock("paragraf", "lihat https://contoh.test")];
    expect(sceneIssues(scene, []).join(" ")).toContain("alamat web");
    scene.steps[0].blocks = [createTextBlock("paragraf", "   ")];
    expect(sceneIssues(scene, []).join(" ")).toContain("teks masih kosong");
  });

  it("memecah daftar poin per baris", () => {
    expect(splitPoints(" satu \n\n dua ")).toEqual(["satu", "dua"]);
  });
});
