import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "./index";
import { checkManifest } from "./materialManifest";
import { canonicalJson, readZipEntries } from "./materials";

const TEST_PRIVATE_KEY =
  "MC4CAQAwBQYDK2VwBCIEIFcCWpPVtIyUjgFFlqeXoOZeWiNU1S7iqq43GSIZAdIk";
const TEST_PUBLIC_KEY = "HxYJgNrK0CMB6EnzmL1pBMPjWIcPwze12ecr/xBAoYo=";
const ADMIN_TOKEN = "admin-token-test";

const env: Env = {
  SUPABASE_URL: "https://supabase.test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
  DEVICE_TOKEN_SECRET: "device-secret-test",
  ENROLLMENT_CODE_PEPPER: "pepper-test",
  ACTIVATION_CODE_PEPPER: "activation-pepper-test",
  LICENSE_SIGNING_PRIVATE_KEY: TEST_PRIVATE_KEY,
  ADMIN_API_TOKEN: ADMIN_TOKEN,
  CONTENT_SIGNING_KEY: TEST_PRIVATE_KEY,
  CONTENT_KEY_ID: "content-test-1",
  CONTENT_BUCKET: "material-bundles",
  CORS_ORIGIN: "http://localhost:1420"
};

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value.padEnd(Math.ceil(value.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const encoder = new TextEncoder();

function hexHash(value: string): string {
  // Pemanasan: pola sha256 yang divalidasi manifest hanya 64 heksa kecil.
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return String(hash.toString(16).padStart(8, "0")).padEnd(64, "0").slice(0, 64);
}

const FILES = [
  { path: "index.html", text: "<!doctype html><title>Mengenal Huruf</title>" },
  { path: "assets/app.js", text: "console.log('huruf');" },
  { path: "assets/cover.webp", text: "RIFF-PREFIX-BUATAN-SENDIRI" },
  { path: "transcript.txt", text: "Transkrip materi mengenal huruf." }
];

const manifest = {
  schemaVersion: "1.0.0",
  materialId: "mengenal-huruf",
  version: "1.0.0",
  title: "Mengenal Huruf",
  summary: "Tiga langkah mengenal huruf dan suku kata.",
  locale: "id-ID",
  gradeLevels: [1],
  subjects: ["bahasa-indonesia"],
  topics: ["huruf dan suku kata"],
  estimatedMinutes: 5,
  entry: "index.html",
  cover: "assets/cover.webp",
  transcriptPath: "transcript.txt",
  accessibility: {
    hasAudio: false,
    keyboardNavigable: true,
    supportsReducedMotion: true,
    contrastChecked: false
  },
  completion: { mode: "signal", minDwellSeconds: 2 },
  minAppVersion: "0.1.0",
  publisher: { name: "Gerbang Edukasi" },
  reviewStatus: "reviewed",
  files: FILES.map((file) => ({
    path: file.path,
    mediaType: file.path.endsWith(".html")
      ? "text/html"
      : file.path.endsWith(".js")
        ? "text/javascript"
        : file.path.endsWith(".webp")
          ? "image/webp"
          : "text/plain",
    bytes: encoder.encode(file.text).length,
    sha256: hexHash(file.path)
  }))
};

/// ZIP STORE tanpa kompresi — bentuk yang sama dengan hasil `material-pack.mjs`.
function buildZip(entries: Array<{ name: string; text: string }>): Uint8Array {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const view = (size: number) => new Uint8Array(size);
  const putU16 = (bytes: Uint8Array, at: number, value: number) => {
    bytes[at] = value & 255;
    bytes[at + 1] = (value >> 8) & 255;
  };
  const putU32 = (bytes: Uint8Array, at: number, value: number) => {
    bytes[at] = value & 255;
    bytes[at + 1] = (value >> 8) & 255;
    bytes[at + 2] = (value >> 16) & 255;
    bytes[at + 3] = (value >> 24) & 255;
  };

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = encoder.encode(entry.text);
    const local = view(30 + name.length);
    putU32(local, 0, 0x04034b50);
    putU16(local, 4, 20);
    putU16(local, 8, 0); // STORE
    putU32(local, 14, 0); // crc (pembaca uji tidak memeriksanya)
    putU32(local, 18, data.length);
    putU32(local, 22, data.length);
    putU16(local, 26, name.length);
    putU16(local, 28, 0);
    local.set(name, 30);
    chunks.push(local, data);

    const record = view(46 + name.length);
    putU32(record, 0, 0x02014b50);
    putU16(record, 4, 20);
    putU16(record, 6, 20);
    putU16(record, 10, 0); // STORE
    putU32(record, 16, 0);
    putU32(record, 20, data.length);
    putU32(record, 24, data.length);
    putU16(record, 28, name.length);
    putU32(record, 42, offset);
    record.set(name, 46);
    central.push(record);
    offset += local.length + data.length;
  }

  const centralSize = central.reduce((sum, bytes) => sum + bytes.length, 0);
  const eocd = view(22);
  putU32(eocd, 0, 0x06054b50);
  putU16(eocd, 8, entries.length);
  putU16(eocd, 10, entries.length);
  putU32(eocd, 12, centralSize);
  putU32(eocd, 16, offset);

  const bytes: number[] = [];
  for (const chunk of [...chunks, ...central, eocd]) bytes.push(...chunk);
  return new Uint8Array(bytes);
}

const ZIP_ENTRIES = [{ name: "material.json", text: JSON.stringify(manifest) }, ...FILES.map((file) => ({ name: file.path, text: file.text }))];
const zip = buildZip(ZIP_ENTRIES);

function materialRow(overrides: Record<string, unknown> = {}) {
  return {
    material_id: "mengenal-huruf",
    version: "1.0.0",
    title: "Mengenal Huruf",
    summary: "Tiga langkah mengenal huruf dan suku kata.",
    review_status: "reviewed",
    manifest,
    bundle_path: "mengenal-huruf/1.0.0/bundle.zip",
    cover_path: "mengenal-huruf/1.0.0/assets-cover.webp",
    size_bytes: 185_301,
    bundle_sha256: hexHash("bundle"),
    key_id: "content-test-1",
    signature: "AAAA",
    published_at: "2026-10-28T06:00:00Z",
    updated_at: "2026-10-28T06:00:00Z",
    ...overrides
  };
}

let calls: Array<{ url: string; init: RequestInit }> = [];

function mockBackend(rows: unknown[], overrides: Record<string, unknown> = {}) {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init: init ?? {} });

      if (url.includes("/storage/v1/object/sign/")) {
        const path = url.split("/sign/")[1].split("?")[0];
        return new Response(JSON.stringify({ signedURL: `/storage/v1/object/sign/${path}?token=tok-1` }));
      }
      if (url.includes("/storage/v1/object/")) {
        return new Response(JSON.stringify({ Path: "ok" }), { status: 200 });
      }
      if (url.includes("/rest/v1/materials")) {
        if (url.includes("select=manifest")) {
          return new Response(JSON.stringify([{ manifest: { ...manifest, ...(overrides as object) } }]));
        }
        if (url.includes("select=updated_at")) {
          return new Response(JSON.stringify([{ updated_at: "2026-10-28T06:00:00Z" }]));
        }
        if (url.includes("select=bundle_sha256")) {
          return new Response(JSON.stringify(Array.isArray(rows) ? rows : []));
        }
        return new Response(JSON.stringify(rows));
      }
      return new Response("{}", { status: 200 });
    })
  );
}

function getMaterials(query = "", token?: string): Promise<Response> {
  return worker.fetch(
    new Request(`https://api.test/v1/materials${query}`, {
      headers: token ? { authorization: `Bearer ${token}` } : {}
    }),
    env
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("katalog materi /v1/materials", () => {
  it("mengembalikan bentuk item persis seperti yang diterima klien Rust", async () => {
    mockBackend([materialRow()]);
    const response = await getMaterials();
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: Array<Record<string, unknown>> };
    expect(body.items).toHaveLength(1);
    // RawItem memakai deny_unknown_fields: satu field asing = katalog ditolak aplikasi.
    expect(Object.keys(body.items[0]).sort()).toEqual(
      [
        "bundleSha256",
        "coverUrl",
        "downloadUrl",
        "material",
        "materialId",
        "publishedAt",
        "signature",
        "sizeBytes",
        "updatedAt",
        "version"
      ].sort()
    );
    expect(Object.keys(body.items[0].signature as object).sort()).toEqual([
      "algorithm",
      "keyId",
      "value"
    ]);
    expect((body.items[0].signature as { algorithm: string }).algorithm).toBe("ed25519");
    expect(body.items[0].downloadUrl).toBe(
      "https://supabase.test/storage/v1/object/sign/material-bundles/mengenal-huruf/1.0.0/bundle.zip?token=tok-1"
    );
  });

  it("hanya memuat reviewed/approved untuk permintaan anonim", async () => {
    mockBackend([]);
    await getMaterials();
    const query = calls[0]?.url ?? "";
    expect(query).toContain("review_status=in.(reviewed,approved)");
    expect(query).toContain("unpublished_at=is.null");
    expect(query).toContain("order=published_at.desc,material_id.asc");
  });

  it("token admin membuka draf, tanpa token tidak", async () => {
    mockBackend([]);
    await getMaterials("", ADMIN_TOKEN);
    expect(calls[0]?.url).toContain("review_status=in.(draft,reviewed,approved)");
    mockBackend([]);
    await getMaterials("", "bukan-token");
    expect(calls[0]?.url).toContain("review_status=in.(reviewed,approved)");
  });

  it("menyaring kelas dan mapel lewat containment array", async () => {
    mockBackend([]);
    await getMaterials("?grade=1&subject=bahasa-indonesia");
    expect(calls[0]?.url).toContain("grade_levels=cs.%7B1%7D");
    expect(calls[0]?.url).toContain("subjects=cs.%7Bbahasa-indonesia%7D");
  });

  it("menolak parameter tak dikenal dan nilai di luar rentang", async () => {
    mockBackend([]);
    const unknown = await getMaterials("?page=2");
    expect(unknown.status).toBe(400);
    expect(((await unknown.json()) as { error: { code: string } }).error.code).toBe("INVALID_QUERY");

    const badGrade = await getMaterials("?grade=7");
    expect(badGrade.status).toBe(400);

    const badLimit = await getMaterials("?limit=500");
    expect(badLimit.status).toBe(400);
  });

  it("memakai ETag stabil atas isi, bukan URL pre-signed, dan menjawab 304", async () => {
    mockBackend([materialRow()]);
    const first = await getMaterials();
    const etag = first.headers.get("etag");
    expect(etag).toMatch(/^"[0-9a-f]{64}"$/);
    expect(first.headers.get("cache-control")).toBe("public, max-age=300");

    mockBackend([materialRow()]);
    const second = await getMaterials();
    expect(second.headers.get("etag")).toBe(etag); // URL token sama, tetapi ETag tidak boleh bergantung padanya

    mockBackend([materialRow()]);
    const third = await getMaterials("", undefined);
    const again = await worker.fetch(
      new Request("https://api.test/v1/materials", { headers: { "if-none-match": String(third.headers.get("etag")) } }),
      env
    );
    expect(again.status).toBe(304);
    expect(await again.text()).toBe("");
  });

  it("baris tanpa tanda tangan tidak pernah tayang", async () => {
    mockBackend([materialRow({ signature: null, key_id: null })]);
    const body = (await (await getMaterials()).json()) as { items: unknown[] };
    expect(body.items).toHaveLength(0);
  });

  it("cover tanpa path tidak memunculkan coverUrl", async () => {
    mockBackend([materialRow({ cover_path: null })]);
    const body = (await (await getMaterials()).json()) as { items: Array<Record<string, unknown>> };
    expect("coverUrl" in body.items[0]).toBe(false);
  });

  it("menandai halaman berikutnya dengan cursor offset yang dapat dibaca kembali", async () => {
    mockBackend(Array.from({ length: 3 }, (_, index) => materialRow({ material_id: `materi-${index}` })));
    const body = (await (await getMaterials("?limit=2")).json()) as {
      items: unknown[];
      nextCursor: string | null;
    };
    expect(body.items).toHaveLength(2);
    expect(body.nextCursor).toEqual(expect.any(String));
    expect(Number(atob(String(body.nextCursor).replace(/-/g, "+").replace(/_/g, "/")))).toBe(2);
  });

  it("tanda tangan item sah atas manifest kanonik dengan kunci publik", async () => {
    // Tanda tangan dihitung saat publish; di sini kita periksa bahwa nilai yang
    // disajikan katalog memang sah terhadap canonical(manifest).
    const key = await crypto.subtle.importKey(
      "pkcs8",
      toArrayBuffer(base64ToBytes(TEST_PRIVATE_KEY)),
      { name: "Ed25519" } as AlgorithmIdentifier,
      false,
      ["sign"]
    );
    const signed = new Uint8Array(
      await crypto.subtle.sign(
        { name: "Ed25519" } as AlgorithmIdentifier,
        key,
        toArrayBuffer(encoder.encode(canonicalJson(manifest)))
      )
    );
    const value = btoa(String.fromCharCode(...signed))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    mockBackend([materialRow({ signature: value })]);
    const body = (await (await getMaterials()).json()) as {
      items: Array<{ signature: { value: string }; material: unknown }>;
    };

    const verifier = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(base64ToBytes(TEST_PUBLIC_KEY)),
      { name: "Ed25519" } as AlgorithmIdentifier,
      false,
      ["verify"]
    );
    const ok = await crypto.subtle.verify(
      { name: "Ed25519" } as AlgorithmIdentifier,
      verifier,
      toArrayBuffer(base64ToBytes(body.items[0].signature.value.replace(/-/g, "+").replace(/_/g, "/"))),
      toArrayBuffer(encoder.encode(canonicalJson(body.items[0].material)))
    );
    expect(ok).toBe(true);
  });
});

describe("publish materi", () => {
  function publishRequest(form: FormData, token = ADMIN_TOKEN): Request {
    return new Request("https://api.test/v1/materials/publish", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: form
    });
  }

  function formWith(bundle: Uint8Array, manifestValue = manifest): FormData {
    const form = new FormData();
    form.set("manifest", JSON.stringify(manifestValue));
    form.set("bundle", new File([bundle as unknown as BlobPart], "bundle.zip", { type: "application/zip" }));
    return form;
  }

  it("menolak tanpa token admin", async () => {
    mockBackend([]);
    const response = await worker.fetch(publishRequest(formWith(zip), "salah"), env);
    expect(response.status).toBe(401);
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe("MATERIAL_ADMIN_REQUIRED");
  });

  it("menolak manifest yang melanggar kontrak §4", async () => {
    mockBackend([]);
    const broken = { ...manifest, accessibility: { ...manifest.accessibility, keyboardNavigable: false } };
    const response = await worker.fetch(publishRequest(formWith(zip, broken)), env);
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("MATERIAL_MANIFEST_INVALID");
    expect(body.error.message).toContain("keyboardNavigable");
  });

  it("menolak ZIP yang berisi berkas tak terdaftar di manifest", async () => {
    mockBackend([]);
    const extra = buildZip([...ZIP_ENTRIES, { name: "assets/curl.html", text: "<script> jahat </script>" }]);
    const response = await worker.fetch(publishRequest(formWith(extra)), env);
    expect(response.status).toBe(400);
    expect(((await response.json()) as { error: { message: string } }).error.message).toContain(
      "berkas tak terdaftar"
    );
  });

  it("menolak terbit ulang versi sama dengan isi berbeda (§11.6)", async () => {
    mockBackend([{ bundle_sha256: "f".repeat(64), size_bytes: 999, unpublished_at: null }]);
    const response = await worker.fetch(publishRequest(formWith(zip)), env);
    expect(response.status).toBe(409);
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe("MATERIAL_VERSION_CONFLICT");
  });

  it("mengunggah bundel, menulis baris, lalu menandatangani manifest hasil baca ulang", async () => {
    mockBackend([]);
    const response = await worker.fetch(publishRequest(formWith(zip)), env);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      bundleSha256: string;
      keyId: string;
      bundlePath: string;
      sizeBytes: number;
    };
    expect(body.keyId).toBe("content-test-1");
    expect(body.bundlePath).toBe("mengenal-huruf/1.0.0/bundle.zip");
    expect(body.sizeBytes).toBe(zip.length);

    const uploaded = calls.find((call) => call.url.endsWith("/storage/v1/object/material-bundles/mengenal-huruf/1.0.0/bundle.zip"));
    expect(uploaded?.init.method).toBe("POST");

    const patched = calls.find((call) => call.init.method === "PATCH");
    expect(patched?.url).toContain("material_id=eq.mengenal-huruf");
    const patchBody = JSON.parse(String((patched?.init.body as string) ?? "{}")) as {
      key_id: string;
      signature: string;
    };
    expect(patchBody.key_id).toBe("content-test-1");
    expect(patchBody.signature).toMatch(/^[A-Za-z0-9_-]{86,88}$/);

    // Tanda tangan harus sah atas manifest yang sama yang nanti disajikan katalog.
    const verifier = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(base64ToBytes(TEST_PUBLIC_KEY)),
      { name: "Ed25519" } as AlgorithmIdentifier,
      false,
      ["verify"]
    );
    const ok = await crypto.subtle.verify(
      { name: "Ed25519" } as AlgorithmIdentifier,
      verifier,
      toArrayBuffer(base64ToBytes(patchBody.signature.replace(/-/g, "+").replace(/_/g, "/"))),
      toArrayBuffer(encoder.encode(canonicalJson(manifest)))
    );
    expect(ok).toBe(true);
  });
});

describe("penanda unpublish", () => {
  it("menandai baris withdrawn dan menolak id tak sah", async () => {
    mockBackend([materialRow()]);
    const response = await worker.fetch(
      new Request("https://api.test/v1/materials/unpublish", {
        method: "POST",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}`, "content-type": "application/json" },
        body: JSON.stringify({ materialId: "mengenal-huruf", version: "1.0.0" })
      }),
      env
    );
    expect(response.status).toBe(200);
    expect(calls.some((call) => call.init.method === "PATCH" && String(call.init.body).includes("unpublished_at"))).toBe(
      true
    );

    mockBackend([]);
    const bad = await worker.fetch(
      new Request("https://api.test/v1/materials/unpublish", {
        method: "POST",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}`, "content-type": "application/json" },
        body: JSON.stringify({ materialId: "ABC", version: "1" })
      }),
      env
    );
    expect(bad.status).toBe(400);
  });
});

describe("pembaca ZIP", () => {
  it("membaca nama dan ukuran dari Central Directory", () => {
    const entries = readZipEntries(zip);
    expect(entries.map((entry) => entry.name)).toEqual([
      "material.json",
      "index.html",
      "assets/app.js",
      "assets/cover.webp",
      "transcript.txt"
    ]);
    expect(entries.find((entry) => entry.name === "index.html")?.uncompressedSize).toBe(
      encoder.encode(FILES[0].text).length
    );
  });

  it("menolak berkas yang bukan ZIP", () => {
    expect(() => readZipEntries(new Uint8Array([1, 2, 3, 4]))).toThrow(/bukan ZIP/);
  });
});

describe("manifest menerima berkas video", () => {
  function videoManifest(path: string, mediaType: string) {
    return {
      ...manifest,
      files: [
        ...manifest.files,
        { path, mediaType, bytes: 1_048_576, sha256: hexHash(path) }
      ]
    };
  }

  it("mp4 dan webm diizinkan dengan mediaType yang cocok", () => {
    expect(checkManifest(videoManifest("assets/pembuka.mp4", "video/mp4"))).toEqual([]);
    expect(checkManifest(videoManifest("assets/pembuka.webm", "video/webm"))).toEqual([]);
  });

  it("menolak mediaType yang tidak cocok dengan ekstensi", () => {
    const issues = checkManifest(videoManifest("assets/pembuka.mp4", "application/octet-stream"));
    expect(issues.map((issue) => issue.message).join(" ")).toContain("video/mp4");
  });

  it("menolak ekstensi video yang tidak diizinkan", () => {
    const issues = checkManifest(videoManifest("assets/pembuka.avi", "video/avi"));
    expect(issues.map((issue) => issue.message).join(" ")).toContain("tidak diizinkan");
  });
});
