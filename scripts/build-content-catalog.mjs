import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCatalogEntries } from "./lib/contentCatalog.mjs";

const target = path.resolve("public/content-catalog.json");
mkdirSync(path.dirname(target), { recursive: true });

const entries = buildCatalogEntries("content/packages");
writeFileSync(target, `${JSON.stringify({ entries })}\n`);
console.log(`catalog: ${entries.length} lesson dari ${new Set(entries.map((e) => e.packageId)).size} paket`);
