import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { contentPackageManifestSchema } from "../src/content/schema/manifest";
import { activitySchema } from "../src/content/schema/activity";
import { lessonSchema } from "../src/content/schema/lesson";
import { contentPackageInputSchema } from "../src/content/validatePackage";

const outDir = "content/schema";

const artifacts: Array<[string, z.ZodType]> = [
  ["manifest.schema.json", contentPackageManifestSchema],
  ["lesson.schema.json", lessonSchema],
  ["activity.schema.json", activitySchema],
  ["content-package.schema.json", contentPackageInputSchema]
];

async function main(): Promise<void> {
  await mkdir(outDir, { recursive: true });
  for (const [fileName, schema] of artifacts) {
    const jsonSchema = z.toJSONSchema(schema, { target: "draft-2020-12" });
    await writeFile(join(outDir, fileName), `${JSON.stringify(jsonSchema, null, 2)}\n`, "utf8");
    console.log(`wrote ${join(outDir, fileName)}`);
  }
}

main().catch((error: unknown) => {
  console.error(`Gagal mengekspor JSON Schema: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
