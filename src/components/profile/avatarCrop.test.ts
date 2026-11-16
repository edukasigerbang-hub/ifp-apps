import { describe, expect, it } from "vitest";
import {
  AVATAR_OUTPUT,
  AVATAR_VIEWPORT,
  centeredOffset,
  clampOffset,
  coverScale,
  cropDrawRect
} from "./avatarCrop";

const landscape = { width: 1600, height: 900 };
const portrait = { width: 1000, height: 2000 };

describe("coverScale", () => {
  it("menutup viewport persegi untuk gambar lanskap dan potret", () => {
    expect(coverScale(landscape, 288)).toBeCloseTo(0.32);
    expect(coverScale(portrait, 288)).toBeCloseTo(0.288);
  });

  it("mengembalikan 1 untuk gambar kosong", () => {
    expect(coverScale({ width: 0, height: 0 }, 288)).toBe(1);
  });
});

describe("clampOffset", () => {
  it("menjaga gambar tetap menutup viewport", () => {
    const scale = coverScale(landscape, AVATAR_VIEWPORT);
    const tooFarLeft = clampOffset({ x: 50, y: 0 }, landscape, scale, AVATAR_VIEWPORT);
    expect(tooFarLeft.x).toBe(0);

    const tooFarRight = clampOffset({ x: -5000, y: 0 }, landscape, scale, AVATAR_VIEWPORT);
    expect(tooFarRight.x).toBeCloseTo(AVATAR_VIEWPORT - landscape.width * scale);

    const tooFarUp = clampOffset({ x: 0, y: -5000 }, landscape, scale, AVATAR_VIEWPORT);
    expect(tooFarUp.y).toBeCloseTo(AVATAR_VIEWPORT - landscape.height * scale);
  });

  it("memusatkan gambar tanpa melewati batas", () => {
    const scale = coverScale(landscape, AVATAR_VIEWPORT);
    const centered = centeredOffset(landscape, scale, AVATAR_VIEWPORT);
    expect(centered.x).toBeCloseTo((AVATAR_VIEWPORT - landscape.width * scale) / 2);
    expect(centered.y).toBeCloseTo(0);
  });
});

describe("cropDrawRect", () => {
  it("memetakan offset viewport ke kanvas keluaran", () => {
    const scale = coverScale(landscape, AVATAR_VIEWPORT);
    const offset = { x: -20, y: 0 };
    const rect = cropDrawRect(offset, landscape, scale, AVATAR_VIEWPORT, AVATAR_OUTPUT);
    const factor = AVATAR_OUTPUT / AVATAR_VIEWPORT;
    expect(rect.dx).toBeCloseTo(-20 * factor);
    expect(rect.dw).toBeCloseTo(landscape.width * scale * factor);
    expect(rect.dx + rect.dw).toBeGreaterThanOrEqual(AVATAR_OUTPUT - 0.001);
    expect(rect.dy + rect.dh).toBeGreaterThanOrEqual(AVATAR_OUTPUT - 0.001);
  });
});
