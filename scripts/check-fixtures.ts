import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { validatePackageDirectory, type ValidationReport } from "./lib/validatePackageDirectory";

const fixturesRoot = "content/fixtures";
const expectedRoot = join(fixturesRoot, "expected");

const cases = [
  "valid-package",
  "invalid-structure",
  "invalid-references",
  "unsupported-schema"
] as const;

async function readExpected(name: string): Promise<ValidationReport> {
  const raw = await readFile(join(expectedRoot, `${name}.report.json`), "utf8");
  return JSON.parse(raw) as ValidationReport;
}

async function main(): Promise<void> {
  let failures = 0;

  for (const name of cases) {
    try {
      const actual = await validatePackageDirectory(join(fixturesRoot, name));
      const expected = await readExpected(name);
      assert.deepStrictEqual(actual, expected, `output ${name} berbeda dari expected`);
      console.log(`PASS ${name} (${actual.status}, ${actual.issues.length} issue)`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures > 0) {
    console.error(`${failures}/${cases.length} fixture gagal`);
    process.exitCode = 1;
    return;
  }

  console.log(`${cases.length}/${cases.length} fixture cocok dengan expected`);
}

main().catch((error: unknown) => {
  console.error(`Checker gagal: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
});
