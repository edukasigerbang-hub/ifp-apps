import { describe, expect, it } from "vitest";
import { gradeCoverUrl, subjectCoverUrl } from "./coverArt";

describe("coverArt", () => {
  it("memetakan kelas 1–6 ke cover kelas khusus", () => {
    for (const grade of [1, 2, 3, 4, 5, 6]) {
      expect(gradeCoverUrl(grade)).toMatch(new RegExp(`cover-kelas-${grade}\\.webp$`));
    }
  });

  it("memetakan tujuh mata pelajaran inti ke cover mapel khusus", () => {
    const subjects = [
      "bahasa-indonesia",
      "ipas",
      "matematika",
      "pai",
      "pendidikan-pancasila",
      "pjok",
      "seni-rupa"
    ];
    for (const subject of subjects) {
      expect(subjectCoverUrl(subject)).toMatch(
        new RegExp(`cover-mapel-${subject}\\.webp$`)
      );
    }
  });

  it("mengembalikan null bila cover tidak tersedia", () => {
    expect(gradeCoverUrl(7)).toBeNull();
    expect(subjectCoverUrl("bahasa-inggris")).toBeNull();
  });
});
