import { describe, expect, it } from "vitest";
import { sharedStepAsset } from "./explorationIllustration";

describe("sharedStepAsset", () => {
  it("mengembalikan path ketika semua langkah memakai satu gambar", () => {
    expect(
      sharedStepAsset([
        { prompt: "Amati gambar.", assetPath: "assets/satu.webp" },
        { prompt: "Ada berapa apel?", assetPath: "assets/satu.webp" },
      ])
    ).toBe("assets/satu.webp");
  });

  it("mengembalikan null ketika gambar berbeda per langkah", () => {
    expect(
      sharedStepAsset([
        { prompt: "Amati gambar.", assetPath: "assets/satu.webp" },
        { prompt: "Amati gambar.", assetPath: "assets/dua.webp" },
      ])
    ).toBeNull();
  });

  it("mengembalikan null ketika ada langkah tanpa gambar", () => {
    expect(
      sharedStepAsset([
        { prompt: "Amati gambar.", assetPath: "assets/satu.webp" },
        { prompt: "Tanpa gambar." },
      ])
    ).toBeNull();
  });

  it("mengembalikan null ketika tidak ada langkah atau tidak ada gambar", () => {
    expect(sharedStepAsset([])).toBeNull();
    expect(sharedStepAsset([{ prompt: "Tanpa gambar." }])).toBeNull();
  });
});
