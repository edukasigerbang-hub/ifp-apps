// Naskah visual untuk tab "Susun": satu dokumen JSON yang disimpan di dalam
// index.html (blok `<script type="application/json" id="ifp-scene">`) sehingga
// materi tetap satu bundel mandiri dan tetap bisa disunting lewat tab Kode.

export const SCENE_ELEMENT_ID = "ifp-scene";
export const SCENE_SCHEMA_VERSION = 1;
export const MAX_STEPS = 20;
export const MAX_BLOCKS_PER_STEP = 12;
export const MAX_TEXT_LENGTH = 1200;
export const MAX_TITLE_LENGTH = 120;

export const SCENE_THEMES = ["cerah", "tenang", "petualangan"] as const;
export type SceneTheme = (typeof SCENE_THEMES)[number];

export const SCENE_EFFECTS = ["tak-ada", "kilau", "konfeti", "getar", "hujan-huruf"] as const;
export type SceneEffect = (typeof SCENE_EFFECTS)[number];

export const SCENE_SOUNDS = ["tak-ada", "bel", "klik", "whoosh", "tepuk"] as const;
export type SceneSound = (typeof SCENE_SOUNDS)[number];

export const TEXT_STYLES = ["paragraf", "catatan", "kutipan", "poin"] as const;
export type TextStyle = (typeof TEXT_STYLES)[number];

export const TEXT_TONES = ["bawaan", "aksen", "lembut"] as const;
export type TextTone = (typeof TEXT_TONES)[number];

export const TEXT_SIZES = ["kecil", "sedang", "besar"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export const TEXT_ALIGNS = ["kiri", "tengah", "kanan"] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

export const IMAGE_LAYOUTS = ["penuh", "kiri", "kanan"] as const;
export type ImageLayout = (typeof IMAGE_LAYOUTS)[number];

// Sumber blok video: YouTube (iframe pemutar), berkas daring (video https
// langsung), atau berkas lokal yang ikut di dalam bundel sehingga tetap bisa
// diputar tanpa koneksi.
export const VIDEO_SOURCES = ["youtube", "daring", "lokal"] as const;
export type VideoSource = (typeof VIDEO_SOURCES)[number];

export const MAX_URL_LENGTH = 500;

/** Batas satu berkas video lokal; gambar/suara tetap 8 MB (kontrak §3). */
export const MAX_LOCAL_VIDEO_BYTES = 25 * 1024 * 1024;

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export interface TextBlock {
  id: string;
  kind: "teks";
  style: TextStyle;
  text: string;
  bold: boolean;
  italic: boolean;
  tone: TextTone;
  size: TextSize;
  align: TextAlign;
}

export interface ImageBlock {
  id: string;
  kind: "gambar";
  path: string;
  alt: string;
  caption: string;
  layout: ImageLayout;
}

export interface AudioBlock {
  id: string;
  kind: "suara";
  path: string;
  label: string;
  caption: string;
}

export interface VideoBlock {
  id: string;
  kind: "video";
  source: VideoSource;
  /** Alamat YouTube atau berkas video https; kosong untuk sumber lokal. */
  url: string;
  /** Berkas video di draft; hanya dipakai untuk sumber lokal. */
  path: string;
  title: string;
  caption: string;
}

export interface EmbedBlock {
  id: string;
  kind: "semat";
  /** Halaman https yang dimuat di dalam iframe. */
  url: string;
  title: string;
  caption: string;
}

export type SceneBlock = TextBlock | ImageBlock | AudioBlock | VideoBlock | EmbedBlock;

export interface SceneStep {
  id: string;
  title: string;
  effect: SceneEffect;
  sound: SceneSound;
  blocks: SceneBlock[];
}

export interface Scene {
  schemaVersion: typeof SCENE_SCHEMA_VERSION;
  theme: SceneTheme;
  title: string;
  subtitle: string;
  steps: SceneStep[];
}

export const THEME_LABELS: Record<SceneTheme, string> = {
  cerah: "Cerah",
  tenang: "Tenang",
  petualangan: "Petualangan"
};

export const EFFECT_LABELS: Record<SceneEffect, string> = {
  "tak-ada": "Tanpa efek",
  kilau: "Kilau",
  konfeti: "Konfeti",
  getar: "Getar",
  "hujan-huruf": "Hujan huruf"
};

export const SOUND_LABELS: Record<SceneSound, string> = {
  "tak-ada": "Tanpa suara",
  bel: "Bel",
  klik: "Klik",
  whoosh: "Whoosh",
  tepuk: "Tepuk"
};

export const TEXT_STYLE_LABELS: Record<TextStyle, string> = {
  paragraf: "Paragraf",
  catatan: "Catatan",
  kutipan: "Kutipan",
  poin: "Daftar poin"
};

export const TONE_LABELS: Record<TextTone, string> = {
  bawaan: "Teks utama",
  aksen: "Warna aksen",
  lembut: "Abu lembut"
};

export const SIZE_LABELS: Record<TextSize, string> = {
  kecil: "Kecil",
  sedang: "Sedang",
  besar: "Besar"
};

export const ALIGN_LABELS: Record<TextAlign, string> = {
  kiri: "Kiri",
  tengah: "Tengah",
  kanan: "Kanan"
};

export const LAYOUT_LABELS: Record<ImageLayout, string> = {
  penuh: "Selebar halaman",
  kiri: "Kiri teks",
  kanan: "Kanan teks"
};

export const VIDEO_SOURCE_LABELS: Record<VideoSource, string> = {
  youtube: "YouTube",
  daring: "Berkas video daring",
  lokal: "Berkas video lokal"
};

export const CAPTIONS_PATH = "assets/captions.vtt";

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTextBlock(style: TextStyle = "paragraf", text = ""): TextBlock {
  return {
    id: createId("teks"),
    kind: "teks",
    style,
    text,
    bold: false,
    italic: false,
    tone: "bawaan",
    size: "sedang",
    align: "kiri"
  };
}

export function createImageBlock(path = ""): ImageBlock {
  return {
    id: createId("gambar"),
    kind: "gambar",
    path,
    alt: "",
    caption: "",
    layout: "penuh"
  };
}

export function createAudioBlock(path = ""): AudioBlock {
  return {
    id: createId("suara"),
    kind: "suara",
    path,
    label: "Narasi",
    caption: ""
  };
}

export function createVideoBlock(source: VideoSource = "youtube", path = ""): VideoBlock {
  return {
    id: createId("video"),
    kind: "video",
    source,
    url: "",
    path,
    title: "",
    caption: ""
  };
}

export function createEmbedBlock(url = ""): EmbedBlock {
  return {
    id: createId("semat"),
    kind: "semat",
    url,
    title: "",
    caption: ""
  };
}

export function createStep(index: number): SceneStep {
  return {
    id: createId("langkah"),
    title: `Langkah ${index + 1}`,
    effect: "kilau",
    sound: "bel",
    blocks: [createTextBlock()]
  };
}

export function createScene(title: string, subtitle = ""): Scene {
  return {
    schemaVersion: SCENE_SCHEMA_VERSION,
    theme: "cerah",
    title: title.trim() || "Materi Baru",
    subtitle,
    steps: [createStep(0)]
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function choice<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

function parseBlock(value: unknown): SceneBlock | null {
  const record = asRecord(value);
  if (!record) return null;
  const kind = text(record.kind);
  if (kind === "teks") {
    return {
      id: text(record.id) || createId("teks"),
      kind: "teks",
      style: choice(TEXT_STYLES, record.style, "paragraf"),
      text: text(record.text).slice(0, MAX_TEXT_LENGTH),
      bold: record.bold === true,
      italic: record.italic === true,
      tone: choice(TEXT_TONES, record.tone, "bawaan"),
      size: choice(TEXT_SIZES, record.size, "sedang"),
      align: choice(TEXT_ALIGNS, record.align, "kiri")
    };
  }
  if (kind === "gambar") {
    return {
      id: text(record.id) || createId("gambar"),
      kind: "gambar",
      path: text(record.path),
      alt: text(record.alt),
      caption: text(record.caption),
      layout: choice(IMAGE_LAYOUTS, record.layout, "penuh")
    };
  }
  if (kind === "suara") {
    return {
      id: text(record.id) || createId("suara"),
      kind: "suara",
      path: text(record.path),
      label: text(record.label, "Narasi").slice(0, 120),
      caption: text(record.caption).slice(0, 300)
    };
  }
  if (kind === "video") {
    return {
      id: text(record.id) || createId("video"),
      kind: "video",
      source: choice(VIDEO_SOURCES, record.source, "youtube"),
      url: text(record.url).slice(0, MAX_URL_LENGTH),
      path: text(record.path),
      title: text(record.title).slice(0, MAX_TITLE_LENGTH),
      caption: text(record.caption).slice(0, 300)
    };
  }
  if (kind === "semat") {
    return {
      id: text(record.id) || createId("semat"),
      kind: "semat",
      url: text(record.url).slice(0, MAX_URL_LENGTH),
      title: text(record.title).slice(0, MAX_TITLE_LENGTH),
      caption: text(record.caption).slice(0, 300)
    };
  }
  return null;
}

function parseStep(value: unknown, index: number): SceneStep | null {
  const record = asRecord(value);
  if (!record) return null;
  const blocks = Array.isArray(record.blocks)
    ? record.blocks.map(parseBlock).filter((block): block is SceneBlock => block !== null)
    : [];
  return {
    id: text(record.id) || createId("langkah"),
    title: text(record.title, `Langkah ${index + 1}`).slice(0, MAX_TITLE_LENGTH),
    effect: choice(SCENE_EFFECTS, record.effect, "kilau"),
    sound: choice(SCENE_SOUNDS, record.sound, "bel"),
    blocks: blocks.slice(0, MAX_BLOCKS_PER_STEP)
  };
}

/** Membaca naskah yang mungkin rusak; `null` berarti tidak ada naskah yang sah. */
export function parseScene(value: unknown): Scene | null {
  const record = asRecord(value);
  if (!record) return null;
  if (record.schemaVersion !== SCENE_SCHEMA_VERSION) return null;
  const steps = Array.isArray(record.steps)
    ? record.steps
        .map((step, index) => parseStep(step, index))
        .filter((step): step is SceneStep => step !== null)
    : [];
  if (steps.length === 0) return null;
  return {
    schemaVersion: SCENE_SCHEMA_VERSION,
    theme: choice(SCENE_THEMES, record.theme, "cerah"),
    title: text(record.title, "Materi Baru").slice(0, MAX_TITLE_LENGTH),
    subtitle: text(record.subtitle).slice(0, 200),
    steps: steps.slice(0, MAX_STEPS)
  };
}

export function splitPoints(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
}

export function isHttpsUrl(value: string): boolean {
  return parseUrl(value)?.protocol === "https:";
}

/**
 * ID video YouTube dari tautan tonton, youtu.be, shorts, live, atau embed.
 * `null` bila tautannya bukan YouTube atau ID-nya tidak sah.
 */
export function youtubeId(value: string): string | null {
  const parsed = parseUrl(value);
  if (!parsed || parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (host === "youtu.be") {
    const id = segments[0] ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
  if (segments[0] === "watch") {
    const id = parsed.searchParams.get("v") ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }
  if (["embed", "shorts", "live", "v"].includes(segments[0] ?? "")) {
    const id = segments[1] ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }
  return null;
}

/** Blok yang tidak bisa tampil tanpa koneksi internet. */
export function blockNeedsInternet(block: SceneBlock): boolean {
  if (block.kind === "video") {
    return block.source !== "lokal" && block.url.trim().length > 0;
  }
  return block.kind === "semat" && block.url.trim().length > 0;
}

export function sceneNeedsInternet(scene: Scene): boolean {
  return scene.steps.some((step) => step.blocks.some(blockNeedsInternet));
}

/**
 * Pesan yang dapat ditindaklanjuti sebelum "Terapkan" menulis berkas.
 * `assetPaths` adalah daftar path di draft, untuk memastikan gambar ada.
 */
export function sceneIssues(scene: Scene, assetPaths: readonly string[]): string[] {
  const issues: string[] = [];
  if (scene.title.trim().length < 3) {
    issues.push("Judul materi minimal 3 karakter.");
  }
  if (scene.steps.length === 0) {
    issues.push("Tambahkan minimal satu langkah.");
  }

  scene.steps.forEach((step, index) => {
    const label = `Langkah ${index + 1}`;
    if (step.title.trim().length === 0) {
      issues.push(`${label}: judul langkah masih kosong.`);
    }
    step.blocks.forEach((block, position) => {
      const where = `${label} blok ${position + 1}`;
      if (block.kind === "teks") {
        if (block.text.trim().length === 0) {
          issues.push(`${where}: teks masih kosong.`);
        }
        if (block.text.length > MAX_TEXT_LENGTH) {
          issues.push(`${where}: teks melebihi ${MAX_TEXT_LENGTH} karakter.`);
        }
        if (block.style === "poin" && splitPoints(block.text).length > 8) {
          issues.push(`${where}: daftar poin maksimal 8 baris.`);
        }
        if (/https?:\/\//i.test(block.text)) {
          issues.push(`${where}: memuat alamat web; bundel harus mandiri.`);
        }
      } else if (block.kind === "gambar") {
        if (!block.path) {
          issues.push(`${where}: belum ada gambar dipilih.`);
        } else if (!assetPaths.includes(block.path)) {
          issues.push(`${where}: gambar ${block.path} tidak ada di draft.`);
        }
        if (block.alt.trim().length === 0) {
          issues.push(`${where}: teks alternatif gambar wajib diisi.`);
        }
        if (/https?:\/\//i.test(block.caption)) {
          issues.push(`${where}: caption memuat alamat web; bundel harus mandiri.`);
        }
      } else if (block.kind === "suara") {
        if (!block.path) {
          issues.push(`${where}: belum ada berkas suara dipilih.`);
        } else if (!assetPaths.includes(block.path)) {
          issues.push(`${where}: berkas suara ${block.path} tidak ada di draft.`);
        }
        if (block.label.trim().length === 0) {
          issues.push(`${where}: label suara wajib diisi.`);
        }
        if (/https?:\/\//i.test(`${block.caption} ${block.label}`)) {
          issues.push(`${where}: caption memuat alamat web; bundel harus mandiri.`);
        }
      } else if (block.kind === "video") {
        if (block.source === "lokal") {
          if (!block.path) {
            issues.push(`${where}: belum ada berkas video dipilih.`);
          } else if (!assetPaths.includes(block.path)) {
            issues.push(`${where}: berkas video ${block.path} tidak ada di draft.`);
          }
        } else if (block.source === "youtube") {
          if (youtubeId(block.url) === null) {
            issues.push(`${where}: tautan YouTube belum sah.`);
          }
        } else if (!isHttpsUrl(block.url)) {
          issues.push(`${where}: berkas video daring harus alamat https://.`);
        }
        if (block.title.trim().length === 0) {
          issues.push(`${where}: judul video wajib diisi (dibacakan pembaca layar).`);
        }
      } else {
        if (!isHttpsUrl(block.url)) {
          issues.push(`${where}: alamat sematan harus diawali https://.`);
        }
        if (block.title.trim().length === 0) {
          issues.push(`${where}: judul sematan wajib diisi (dibacakan pembaca layar).`);
        }
      }
    });
  });
  return issues;
}

export function nextStepTitle(steps: readonly SceneStep[]): string {
  return `Langkah ${steps.length + 1}`;
}

export function sceneAudioBlocks(scene: Scene): AudioBlock[] {
  return scene.steps
    .flatMap((step) => step.blocks)
    .filter((block): block is AudioBlock => block.kind === "suara" && block.path.length > 0);
}

export function sceneImages(scene: Scene): string[] {
  const paths = scene.steps
    .flatMap((step) => step.blocks)
    .filter((block): block is ImageBlock => block.kind === "gambar")
    .map((block) => block.path)
    .filter((path) => path.length > 0);
  return [...new Set(paths)];
}
