import { describe, expect, it } from "vitest";
import { distanceToSegment, strokeIntersectsPath, type PenStroke } from "./penGeometry";

function stroke(points: { x: number; y: number }[], width = 4): PenStroke {
  return { id: "s1", color: "#0f766e", width, points };
}

describe("distanceToSegment", () => {
  it("mengembalikan jarak tegak lurus ke segmen", () => {
    expect(distanceToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(3);
  });

  it("membatasi proyeksi pada ujung segmen", () => {
    expect(distanceToSegment({ x: 14, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(5);
  });

  it("menangani segmen nol panjang sebagai jarak titik", () => {
    expect(distanceToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeCloseTo(5);
  });
});

describe("strokeIntersectsPath", () => {
  it("mendeteksi jalur yang menyentuh segmen stroke", () => {
    const line = stroke([
      { x: 100, y: 150 },
      { x: 300, y: 150 }
    ]);
    expect(strokeIntersectsPath(line, [{ x: 200, y: 153 }], 8)).toBe(true);
  });

  it("mendeteksi stroke bertitik tunggal dengan jari-jari stroke ikut dihitung", () => {
    const dot = stroke([{ x: 200, y: 150 }], 10);
    expect(strokeIntersectsPath(dot, [{ x: 208, y: 150 }], 4)).toBe(true);
  });

  it("mengembalikan false bila jalur jauh dari stroke", () => {
    const line = stroke([
      { x: 40, y: 30 },
      { x: 80, y: 30 }
    ]);
    expect(strokeIntersectsPath(line, [{ x: 320, y: 240 }], 8)).toBe(false);
  });

  it("mengembalikan false untuk jalur atau stroke kosong", () => {
    expect(strokeIntersectsPath(stroke([]), [{ x: 200, y: 150 }], 8)).toBe(false);
    expect(strokeIntersectsPath(stroke([{ x: 200, y: 150 }]), [], 8)).toBe(false);
  });
});
