import { describe, expect, it } from "vitest";
import {
  buildCatalog,
  catalogFacets,
  filterCatalog,
  findLessonEntry,
  type CatalogLessonEntry,
  type CatalogPackageInput
} from "../catalog";
import type { ContentPackage } from "../validatePackage";

function entry(overrides: Partial<CatalogLessonEntry> = {}): CatalogLessonEntry {
  return {
    packageId: "matematika-kelas3-pecahan",
    version: "0.1.0",
    packageTitle: "Pecahan Sederhana",
    lessonId: "pecahan-sederhana",
    lessonTitle: "Mengenal Pecahan",
    summary: "Mengenal pecahan melalui gambar.",
    gradeLevels: [3],
    subjects: ["matematika"],
    objectives: ["Menunjukkan pecahan 1/2"],
    activityCount: 2,
    source: "bundled",
    ...overrides
  };
}

function packageInput(
  packageId: string,
  source: "bundled" | "managed",
  title: string,
  lessonId: string,
  lessonTitle: string,
  activityId: string
): CatalogPackageInput {
  const data = {
    manifest: {
      packageId,
      packageVersion: "1.0.0",
      title,
      gradeLevels: [3],
      subjects: ["matematika"]
    },
    lessons: [
      {
        lessonId,
        title: lessonTitle,
        summary: "Ringkasan",
        learningObjectives: ["Tujuan"],
        activityIds: [activityId]
      }
    ],
    activities: [{ activityId }]
  } as unknown as ContentPackage;
  return { data, source };
}

describe("filterCatalog", () => {
  const entries = [
    entry(),
    entry({
      packageId: "ipa-kelas3",
      packageTitle: "IPA",
      lessonId: "wujud-benda",
      lessonTitle: "Wujud Benda",
      summary: "Padat, cair, gas.",
      subjects: ["ipa"],
      objectives: ["Mengenal wujud benda"]
    })
  ];

  it("mencocokkan kata kunci pada judul dan tujuan", () => {
    expect(filterCatalog(entries, { query: "pecahan", grade: null, subject: null })).toHaveLength(1);
    expect(filterCatalog(entries, { query: "wujud", grade: null, subject: null })).toHaveLength(1);
    expect(filterCatalog(entries, { query: "tidak-ada", grade: null, subject: null })).toHaveLength(0);
  });

  it("memfilter kelas dan mata pelajaran", () => {
    expect(filterCatalog(entries, { query: "", grade: 3, subject: "ipa" })).toHaveLength(1);
    expect(filterCatalog(entries, { query: "", grade: 4, subject: null })).toHaveLength(0);
  });

  it("mengabaikan spasi dan huruf besar", () => {
    expect(filterCatalog(entries, { query: "  PECAHAN  ", grade: null, subject: null })).toHaveLength(
      1
    );
  });
});

describe("buildCatalog", () => {
  it("memilih paket managed saat id sama dengan bundled", () => {
    const entries = buildCatalog([
      packageInput("pkg", "bundled", "Bundled", "lesson", "Bundled Lesson", "act"),
      packageInput("pkg", "managed", "Managed", "lesson", "Managed Lesson", "act")
    ]);
    expect(entries).toHaveLength(1);
    expect(entries[0].source).toBe("managed");
    expect(entries[0].packageTitle).toBe("Managed");
  });

  it("mempertahankan paket berbeda dan menghitung aktivitas valid", () => {
    const entries = buildCatalog([
      packageInput("a", "bundled", "A", "lesson-a", "Lesson A", "act-a"),
      packageInput("b", "managed", "B", "lesson-b", "Lesson B", "act-b")
    ]);
    expect(entries).toHaveLength(2);
    expect(entries.every((item) => item.activityCount === 1)).toBe(true);
    expect(findLessonEntry(entries, "lesson-b")?.packageId).toBe("b");
  });
});

describe("catalogFacets", () => {
  it("mengumpulkan kelas dan mapel unik secara terurut", () => {
    const facets = catalogFacets([
      entry({ gradeLevels: [4], subjects: ["ipa"] }),
      entry({ gradeLevels: [3], subjects: ["matematika"] })
    ]);
    expect(facets.grades).toEqual([3, 4]);
    expect(facets.subjects).toEqual(["ipa", "matematika"]);
  });
});
