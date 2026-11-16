import { describe, expect, it } from "vitest";
import { canonicalPackageJson, packageContentDigest } from "../packageDigest";

function buildPackage() {
  return {
    manifest: {
      manifestVersion: 1,
      packageId: "kelas3-matematika-b04-pecahan",
      packageVersion: "0.2.0",
      title: "Pecahan Sederhana",
      releaseState: "draft",
      signature: null
    },
    lessons: [
      {
        lessonId: "pecahan-sederhana",
        title: "Mengenal Pecahan",
        reviewStatus: "draft",
        learningObjectives: ["Menjelaskan pecahan sederhana"]
      },
      {
        lessonId: "membandingkan-pecahan",
        title: "Membandingkan Pecahan",
        reviewStatus: "draft"
      }
    ],
    activities: [
      {
        activityId: "kuis-pecahan",
        type: "quiz",
        questions: [
          {
            questionId: "q1",
            prompt: "Setengah ditulis ...",
            options: [
              { optionId: "a", text: "1/2" },
              { optionId: "b", text: "2/1" }
            ]
          }
        ]
      }
    ]
  };
}

describe("packageContentDigest", () => {
  it("stabil terhadap urutan kunci objek", async () => {
    const first = await packageContentDigest(buildPackage());
    const reordered = {
      manifest: {
        signature: null,
        releaseState: "draft",
        title: "Pecahan Sederhana",
        packageVersion: "0.2.0",
        packageId: "kelas3-matematika-b04-pecahan",
        manifestVersion: 1
      },
      lessons: buildPackage().lessons,
      activities: buildPackage().activities
    };
    expect(await packageContentDigest(reordered)).toBe(first);
  });

  it("mengabaikan status review dan kunci publikasi", async () => {
    const before = await packageContentDigest(buildPackage());
    const approved = buildPackage();
    approved.manifest.releaseState = "approved";
    approved.lessons[0].reviewStatus = "approved";
    expect(await packageContentDigest(approved)).toBe(before);
  });

  it("stabil terhadap urutan lesson dan activity", async () => {
    const before = await packageContentDigest(buildPackage());
    const shuffled = buildPackage();
    shuffled.lessons.reverse();
    expect(await packageContentDigest(shuffled)).toBe(before);
  });

  it("berubah bila isi materi berubah", async () => {
    const before = await packageContentDigest(buildPackage());
    const edited = buildPackage();
    edited.lessons[1].title = "Membandingkan Tiga Pecahan";
    expect(await packageContentDigest(edited)).not.toBe(before);

    const optionEdited = buildPackage();
    optionEdited.activities[0].questions[0].options[1].text = "1/2";
    expect(await packageContentDigest(optionEdited)).not.toBe(before);
  });

  it("menghasilkan hex sha256 64 karakter", async () => {
    const digest = await packageContentDigest(buildPackage());
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("memakai JSON kanonik tanpa spasi struktural", () => {
    const canonical = canonicalPackageJson(buildPackage());
    expect(canonical).toBe(JSON.stringify(JSON.parse(canonical)));
  });
});
