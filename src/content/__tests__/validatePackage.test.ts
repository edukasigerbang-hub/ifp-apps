import { describe, expect, it } from "vitest";
import manifestFixture from "../../../content/fixtures/valid-package/manifest.json";
import lessonFixture from "../../../content/fixtures/valid-package/lessons/lesson-001.json";
import activityExploration from "../../../content/fixtures/valid-package/activities/activity-001.json";
import activityMultipleChoice from "../../../content/fixtures/valid-package/activities/activity-002.json";
import { contentPackageManifestSchema } from "../schema/manifest";
import { validateContentPackage } from "../validatePackage";
import { verifyAssetHashes } from "../verifyAssets";

const PIXEL_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function basePackage() {
  return structuredClone({
    manifest: manifestFixture,
    lessons: [lessonFixture],
    activities: [activityExploration, activityMultipleChoice]
  });
}

function decodePixel(): Uint8Array {
  return Uint8Array.from(atob(PIXEL_BASE64), (character) => character.charCodeAt(0));
}

describe("validateContentPackage", () => {
  it("menerima fixture valid dan menandai lesson draft", () => {
    const result = validateContentPackage(basePackage());

    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.warnings.join(" ")).toContain("draft");
    expect(result.warnings.join(" ")).toContain("curriculumRefs");
  });

  it("menolak schemaVersion yang tidak didukung", () => {
    const packageInput = basePackage();
    (packageInput.manifest as { schemaVersion: string }).schemaVersion = "2.0.0";

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("CONTENT_SCHEMA_UNSUPPORTED");
  });

  it("menolak path aset yang keluar dari root paket", () => {
    const packageInput = basePackage();
    (packageInput.manifest.assets[0] as { path: string }).path = "../pixel.png";

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.path === "manifest.assets.0.path")).toBe(true);
  });

  it("menolak field yang dapat mengeksekusi kode", () => {
    const packageInput = basePackage();
    (packageInput.activities[0].interactionConfig as Record<string, unknown>).script = "alert(1)";

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("field terlarang 'script'"))).toBe(true);
  });

  it("menerima konfigurasi matching yang valid", () => {
    const packageInput = basePackage();
    const activity = packageInput.activities[0] as Record<string, unknown>;
    activity.type = "matching";
    activity.interactionConfig = {
      pairs: [
        { pairId: "pasangan-1", left: "1/2", right: "Setengah" },
        { pairId: "pasangan-2", left: "1/4", right: "Seperempat" }
      ]
    };

    const result = validateContentPackage(packageInput);

    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("menolak matching dengan pairId duplikat", () => {
    const packageInput = basePackage();
    const activity = packageInput.activities[0] as Record<string, unknown>;
    activity.type = "matching";
    activity.interactionConfig = {
      pairs: [
        { pairId: "pasangan-1", left: "1/2", right: "Setengah" },
        { pairId: "pasangan-1", left: "1/4", right: "Seperempat" }
      ]
    };

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("pairId duplikat"))).toBe(true);
  });

  it("menerima konfigurasi ordering yang valid", () => {
    const packageInput = basePackage();
    const activity = packageInput.activities[0] as Record<string, unknown>;
    activity.type = "ordering";
    activity.interactionConfig = {
      items: [
        { itemId: "angka-1", text: "Angka 1" },
        { itemId: "angka-2", text: "Angka 2" },
        { itemId: "angka-3", text: "Angka 3" }
      ],
      correctOrder: ["angka-1", "angka-2", "angka-3"]
    };

    const result = validateContentPackage(packageInput);

    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("menolak ordering yang correctOrder-nya tidak lengkap", () => {
    const packageInput = basePackage();
    const activity = packageInput.activities[0] as Record<string, unknown>;
    activity.type = "ordering";
    activity.interactionConfig = {
      items: [
        { itemId: "angka-1", text: "Angka 1" },
        { itemId: "angka-2", text: "Angka 2" }
      ],
      correctOrder: ["angka-1"]
    };

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.message.includes("correctOrder harus memuat"))
    ).toBe(true);
  });

  it("menolak activityId duplikat", () => {
    const packageInput = basePackage();
    packageInput.activities.push(structuredClone(activityExploration));

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("activityId duplikat"))).toBe(true);
  });

  it("menolak aset aktivitas yang tidak ada di manifest", () => {
    const packageInput = basePackage();
    (packageInput.activities[0] as { assets: string[] }).assets = ["assets/missing.png"];

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("CONTENT_DEPENDENCY_MISSING");
  });

  it("menolak lesson yang mereferensikan aktivitas tidak dikenal", () => {
    const packageInput = basePackage();
    (packageInput.lessons[0] as { activityIds: string[] }).activityIds = ["activity-tidak-ada"];

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("activityId tidak ditemukan"))).toBe(true);
  });

  it("menolak assessmentRef yang tidak memiliki assessmentConfig", () => {
    const packageInput = basePackage();
    (packageInput.lessons[0] as { assessmentRefs: string[] }).assessmentRefs = ["activity-eksplorasi"];

    const result = validateContentPackage(packageInput);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("tidak memiliki assessmentConfig"))).toBe(true);
  });
});

describe("verifyAssetHashes", () => {
  const manifest = contentPackageManifestSchema.parse(manifestFixture);

  it("lolos untuk aset dengan hash dan ukuran yang cocok", async () => {
    const files = new Map([["assets/pixel.png", decodePixel()]]);

    await expect(verifyAssetHashes(manifest, files)).resolves.toEqual([]);
  });

  it("menolak hash yang tidak cocok", async () => {
    const tampered = structuredClone(manifest);
    tampered.assets[0].sha256 = "0".repeat(64);
    const files = new Map([["assets/pixel.png", decodePixel()]]);

    const issues = await verifyAssetHashes(tampered, files);

    expect(issues.map((issue) => issue.code)).toContain("CONTENT_ASSET_HASH_MISMATCH");
  });

  it("menolak aset yang hilang", async () => {
    const issues = await verifyAssetHashes(manifest, new Map());

    expect(issues.map((issue) => issue.code)).toContain("CONTENT_DEPENDENCY_MISSING");
  });
});
