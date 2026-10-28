#!/usr/bin/env node
// Katalog materi tiruan untuk pengembangan lokal (kontrak bundel v1 §6–§7).
// Bukan bagian dari platform: Worker `/v1/materials` + Supabase Storage belum ada,
// jadi alat ini menyajikan bentuk respons yang sama dari berkas bundel di disk.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const PUBLIC_REVIEW_STATES = new Set(["reviewed", "approved"]);
const SUBJECT_PATTERN = /^[a-z0-9-]{1,40}$/;
const CURSOR_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const QUERY_PARAMS = new Set(["grade", "subject", "cursor", "limit"]);

function sendJson(response, statusCode, body, headers = {}) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    ...headers
  });
  response.end(payload);
}

function sendError(response, statusCode, code, message, headers) {
  sendJson(response, statusCode, { error: { code, message } }, headers);
}

function parseQuery(searchParams) {
  for (const name of searchParams.keys()) {
    if (!QUERY_PARAMS.has(name)) {
      return { error: `Parameter "${name}" tidak dikenal katalog.` };
    }
    if (searchParams.getAll(name).length > 1) {
      return { error: `Parameter "${name}" hanya boleh muncul sekali.` };
    }
  }

  const query = { grade: null, subject: null, cursor: null, limit: DEFAULT_LIMIT };

  const grade = searchParams.get("grade");
  if (grade !== null) {
    if (!/^[1-6]$/.test(grade)) {
      return { error: "grade harus 1–6." };
    }
    query.grade = Number(grade);
  }

  const subject = searchParams.get("subject");
  if (subject !== null) {
    if (!SUBJECT_PATTERN.test(subject)) {
      return { error: "subject harus slug huruf kecil." };
    }
    query.subject = subject;
  }

  const limit = searchParams.get("limit");
  if (limit !== null) {
    const parsed = Number(limit);
    if (!/^\d{1,3}$/.test(limit) || parsed < 1 || parsed > MAX_LIMIT) {
      return { error: `limit harus 1–${MAX_LIMIT}.` };
    }
    query.limit = parsed;
  }

  const cursor = searchParams.get("cursor");
  if (cursor !== null) {
    if (!CURSOR_PATTERN.test(cursor)) {
      return { error: "cursor tidak valid." };
    }
    const offset = Number(Buffer.from(cursor, "base64url").toString("utf8"));
    if (!Number.isInteger(offset) || offset < 0) {
      return { error: "cursor tidak valid." };
    }
    query.cursor = offset;
  }

  return { query };
}

function publicItems(catalog) {
  const items = Array.isArray(catalog.items) ? catalog.items : [];
  return items.filter((item) => PUBLIC_REVIEW_STATES.has(item?.material?.reviewStatus));
}

function matches(item, query) {
  const material = item.material;
  if (query.grade !== null && !material.gradeLevels?.includes(query.grade)) {
    return false;
  }
  if (query.subject !== null && !material.subjects?.includes(query.subject)) {
    return false;
  }
  return true;
}

function compareItems(left, right) {
  const leftTime = Date.parse(left.publishedAt ?? "") || 0;
  const rightTime = Date.parse(right.publishedAt ?? "") || 0;
  if (leftTime !== rightTime) {
    return rightTime - leftTime;
  }
  return String(left.materialId).localeCompare(String(right.materialId));
}

const IMAGE_TYPES = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg"
};

function withDownloadUrl(item, origin, token) {
  const { bundleFile, coverFile, ...rest } = item;
  const bundleName = bundleFile ? path.basename(bundleFile) : null;
  const coverName = coverFile ? path.basename(coverFile) : null;
  return {
    ...rest,
    ...(bundleName
      ? {
          downloadUrl: `${origin}/bundles/${encodeURIComponent(bundleName)}?token=${encodeURIComponent(token)}`
        }
      : {}),
    // Cover bersifat kosmetik (§6 kontrak v1): URL pre-signed dengan aturan yang
    // sama seperti downloadUrl dan tidak pernah disimpan klien.
    ...(coverName
      ? {
          coverUrl: `${origin}/covers/${encodeURIComponent(coverName)}?token=${encodeURIComponent(token)}`
        }
      : {})
  };
}

export async function startMockCatalogServer({
  catalogFile,
  bundleDir,
  coverDir,
  token = "dev-token",
  port = 0,
  host = "127.0.0.1",
  quiet = false
} = {}) {
  if (!catalogFile) {
    throw new Error("catalogFile wajib untuk server katalog tiruan.");
  }
  const resolvedCatalog = path.resolve(catalogFile);
  const resolvedBundleDir = path.resolve(bundleDir ?? path.dirname(resolvedCatalog));
  const resolvedCoverDir = path.resolve(coverDir ?? resolvedBundleDir);

  function readCatalog() {
    return JSON.parse(readFileSync(resolvedCatalog, "utf8"));
  }

  function servePage(request, response) {
    let catalog;
    try {
      catalog = readCatalog();
    } catch (error) {
      sendError(response, 500, "CATALOG_UNAVAILABLE", `Katalog tiruan tidak terbaca: ${error.message}`);
      return;
    }

    const url = new URL(request.url, "http://placeholder");
    const { query, error } = parseQuery(url.searchParams);
    if (error) {
      sendError(response, 400, "INVALID_QUERY", error);
      return;
    }

    const eligible = publicItems(catalog).filter((item) => matches(item, query)).sort(compareItems);
    const offset = query.cursor ?? 0;
    const pageItems = eligible.slice(offset, offset + query.limit);
    const nextOffset = offset + pageItems.length;

    // generatedAt harus stabil agar ETag bisa dipakai untuk 304. Berkas katalog
    // ditulis ulang oleh uji negatif, dan mtime berubah → ETag ikut berubah.
    const generatedAt =
      typeof catalog.generatedAt === "string"
        ? catalog.generatedAt
        : new Date(statSync(resolvedCatalog).mtimeMs).toISOString();

    const body = {
      schemaVersion: catalog.schemaVersion ?? "1.0.0",
      generatedAt,
      items: pageItems.map((item) => withDownloadUrl(item, origin, token)),
      nextCursor: nextOffset < eligible.length ? Buffer.from(String(nextOffset)).toString("base64url") : null
    };

    const payload = JSON.stringify(body);
    const etag = `"${createHash("sha256").update(payload).digest("hex")}"`;
    const headers = {
      etag,
      "cache-control": "public, max-age=300",
      "content-type": "application/json; charset=utf-8"
    };

    if (request.headers["if-none-match"] === etag) {
      response.writeHead(304, headers);
      response.end();
      return;
    }

    if (!quiet) {
      console.log(`catalog page ${pageItems.length}/${eligible.length} (offset ${offset})`);
    }
    response.writeHead(200, { ...headers, "content-length": Buffer.byteLength(payload) });
    response.end(payload);
  }

  function serveBundle(request, response) {
    const url = new URL(request.url, "http://placeholder");
    const name = decodeURIComponent(url.pathname.slice("/bundles/".length));

    // Hanya nama berkas polos: cegah traversal keluar dari MOCK_BUNDLE_DIR.
    if (!name || name !== path.basename(name) || name === "." || name === "..") {
      sendError(response, 404, "BUNDLE_NOT_FOUND", "Bundel tidak ditemukan.");
      return;
    }
    if (url.searchParams.get("token") !== token) {
      sendError(response, 403, "BUNDLE_FORBIDDEN", "Token unduhan tidak sah.");
      return;
    }

    const absolute = path.join(resolvedBundleDir, name);
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      sendError(response, 404, "BUNDLE_NOT_FOUND", "Bundel tidak ditemukan.");
      return;
    }

    const bytes = readFileSync(absolute);
    if (!quiet) {
      console.log(`bundle ${name} (${bytes.length} byte)`);
    }
    response.writeHead(200, {
      "content-type": "application/zip",
      "content-length": bytes.length,
      "cache-control": "no-store"
    });
    response.end(bytes);
  }

  function serveCover(request, response) {
    const url = new URL(request.url, "http://placeholder");
    const name = decodeURIComponent(url.pathname.slice("/covers/".length));
    if (!name || name !== path.basename(name) || name === "." || name === "..") {
      sendError(response, 404, "COVER_NOT_FOUND", "Cover tidak ditemukan.");
      return;
    }
    if (url.searchParams.get("token") !== token) {
      sendError(response, 403, "COVER_FORBIDDEN", "Token unduhan tidak sah.");
      return;
    }

    const absolute = path.join(resolvedCoverDir, name);
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      sendError(response, 404, "COVER_NOT_FOUND", "Cover tidak ditemukan.");
      return;
    }
    const type = IMAGE_TYPES[path.extname(name).slice(1).toLowerCase()];
    if (!type) {
      sendError(response, 404, "COVER_NOT_FOUND", "Cover tidak ditemukan.");
      return;
    }

    const bytes = readFileSync(absolute);
    if (!quiet) {
      console.log(`cover ${name} (${bytes.length} byte)`);
    }
    response.writeHead(200, {
      "content-type": type,
      "content-length": bytes.length,
      "cache-control": "no-store"
    });
    response.end(bytes);
  }

  let origin = "";

  const server = createServer((request, response) => {
    try {
      if (request.method !== "GET") {
        sendError(response, 405, "METHOD_NOT_ALLOWED", "Hanya GET yang dilayani katalog tiruan.");
        return;
      }
      if (request.url === "/health") {
        let count = null;
        try {
          count = publicItems(readCatalog()).length;
        } catch {
          count = null;
        }
        sendJson(response, 200, { ok: true, items: count });
        return;
      }
      if (request.url === "/v1/materials" || request.url.startsWith("/v1/materials?")) {
        servePage(request, response);
        return;
      }
      if (request.url.startsWith("/bundles/")) {
        serveBundle(request, response);
        return;
      }
      if (request.url.startsWith("/covers/")) {
        serveCover(request, response);
        return;
      }
      sendError(response, 404, "NOT_FOUND", "Rute tidak dikenal.");
    } catch (error) {
      sendError(response, 500, "CATALOG_UNAVAILABLE", String(error?.message ?? error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  origin = `http://${host}:${address.port}`;

  return {
    origin,
    port: address.port,
    close: () =>
      new Promise((resolve) => {
        server.close(() => resolve());
      })
  };
}

async function cli() {
  const catalogFile = process.env.MOCK_CATALOG_FILE;
  if (!catalogFile) {
    console.error("MOCK_CATALOG_FILE wajib, mis. MOCK_CATALOG_FILE=.tmp/catalog.json npm run catalog:mock");
    process.exitCode = 1;
    return;
  }

  const handle = await startMockCatalogServer({
    catalogFile,
    bundleDir: process.env.MOCK_BUNDLE_DIR ?? path.dirname(path.resolve(catalogFile)),
    coverDir: process.env.MOCK_COVER_DIR ?? process.env.MOCK_BUNDLE_DIR ?? path.dirname(path.resolve(catalogFile)),
    token: process.env.MOCK_BUNDLE_TOKEN ?? "dev-token",
    port: Number(process.env.MOCK_CATALOG_PORT ?? 8789)
  });

  console.log(`katalog tiruan siap di ${handle.origin}/v1/materials`);
  const shutdown = () => {
    handle.close().then(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await cli();
}
