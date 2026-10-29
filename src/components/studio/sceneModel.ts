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

export interface TextBlock {
  id: string;
  kind: "teks";
  style: TextStyle;
  text: string;
}

export interface ImageBlock {
  id: string;
  kind: "gambar";
  path: string;
  alt: string;
  caption: string;
}

export type SceneBlock = TextBlock | ImageBlock;

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

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTextBlock(style: TextStyle = "paragraf", text = ""): TextBlock {
  return { id: createId("teks"), kind: "teks", style, text };
}

export function createImageBlock(path = ""): ImageBlock {
  return { id: createId("gambar"), kind: "gambar", path, alt: "", caption: "" };
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
      text: text(record.text).slice(0, MAX_TEXT_LENGTH)
    };
  }
  if (kind === "gambar") {
    return {
      id: text(record.id) || createId("gambar"),
      kind: "gambar",
      path: text(record.path),
      alt: text(record.alt),
      caption: text(record.caption)
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
      } else {
        if (!block.path) {
          issues.push(`${where}: belum ada gambar dipilih.`);
        } else if (!assetPaths.includes(block.path)) {
          issues.push(`${where}: gambar ${block.path} tidak ada di draft.`);
        }
        if (block.alt.trim().length === 0) {
          issues.push(`${where}: teks alternatif gambar wajib diisi.`);
        }
      }
      if (block.kind === "teks" && /https?:\/\//i.test(block.text)) {
        issues.push(`${where}: teks memuat alamat web; bundel harus mandiri.`);
      }
    });
  });
  return issues;
}

export function nextStepTitle(steps: readonly SceneStep[]): string {
  return `Langkah ${steps.length + 1}`;
}
