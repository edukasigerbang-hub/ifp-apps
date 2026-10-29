#!/usr/bin/env node
// Penerbit materi ke sisi platform (kontrak bundel v1 §11).
// Skrip ini tidak pernah memegang kunci konten: Worker yang menandatangani.
// Kredensial hanya dari environment: ADMIN_API_TOKEN, IFP_API_URL.
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildBundle } from "./material-pack.mjs";

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function required(name, value) {
  if (!value) {
    throw new Error(`Butuh --${name}`);
  }
  return value;
}

function apiBase() {
  return (arg("api") ?? process.env.IFP_API_URL ?? "http://localhost:8787").replace(/\/+$/, "");
}

function adminToken() {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) {
    throw new Error("ADMIN_API_TOKEN harus diisi lewat environment (tidak dibaca dari berkas).");
  }
  return token;
}

async function post(url, init, token) {
  const response = await fetch(url, { ...init, headers: { ...init.headers, authorization: `Bearer ${token}` } });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const detail = body && body.error ? `${body.error.code}: ${body.error.message}` : JSON.stringify(body);
    throw new Error(`${response.status} ${detail}`);
  }
  return body;
}

async function publish() {
  const sourceDir = required("source", arg("source"));
  const { manifest, archive } = buildBundle({ sourceDir });
  const coverRelative = arg("cover") ?? manifest.cover;
  const coverPath = path.isAbsolute(coverRelative) ? coverRelative : path.join(sourceDir, coverRelative);
  const coverBytes = readFileSync(coverPath);

  const form = new FormData();
  form.set("manifest", JSON.stringify(manifest));
  form.set("bundle", new File([archive], "bundle.zip", { type: "application/zip" }));
  form.set("cover", new File([coverBytes], path.basename(coverPath), { type: "image/webp" }));

  const result = await post(`${apiBase()}/v1/materials/publish`, { method: "POST", body: form }, adminToken());
  console.log(JSON.stringify({ mode: "publish", endpoint: `${apiBase()}/v1/materials/publish`, files: manifest.files.length, bytes: archive.length, ...result }, null, 2));
}

async function unpublish() {
  const body = JSON.stringify({
    materialId: required("material-id", arg("material-id")),
    version: required("version", arg("version"))
  });
  const result = await post(`${apiBase()}/v1/materials/unpublish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  }, adminToken());
  console.log(JSON.stringify({ mode: "unpublish", ...result }, null, 2));
}

function usage() {
  console.log("Usage:");
  console.log("  ADMIN_API_TOKEN=… node scripts/material-publish.mjs --source <folder-bundel> [--cover <path>] [--api <url>]");
  console.log("  ADMIN_API_TOKEN=… node scripts/material-publish.mjs unpublish --material-id <id> --version <semver> [--api <url>]");
  process.exit(1);
}

if (process.argv[2] === "unpublish") {
  await unpublish();
} else if (process.argv[2] && !process.argv[2].startsWith("--")) {
  usage();
} else {
  await publish();
}
