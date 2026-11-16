import { beforeEach, describe, expect, it } from "vitest";
import {
  buildPlayerHash,
  getPlaybackSelection,
  parsePlayerHash,
  setPlaybackSelection,
} from "./playbackSelection";

describe("seleksi materi di Player", () => {
  beforeEach(() => {
    setPlaybackSelection({ packageId: "kelas1-bahasa-indonesia-b01-huruf-suku-kata", lessonId: "huruf" });
  });

  it("membaca seleksi berulang kali tanpa kehilangan nilai", () => {
    const first = getPlaybackSelection();
    const second = getPlaybackSelection();

    expect(second).toEqual(first);
    expect(second?.packageId).toBe("kelas1-bahasa-indonesia-b01-huruf-suku-kata");
  });

  it("seleksi terbaru menggantikan seleksi sebelumnya", () => {
    setPlaybackSelection({ packageId: "kelas6-pai-b06-zakat", version: "0.2.0", lessonId: "zakat" });

    expect(getPlaybackSelection()).toEqual({
      packageId: "kelas6-pai-b06-zakat",
      version: "0.2.0",
      lessonId: "zakat"
    });
  });
});

describe("deep link Player", () => {
  it("menulis paket dan lesson ke hash", () => {
    expect(buildPlayerHash({ packageId: "kelas6-pai-b06-zakat", lessonId: "zakat" })).toBe(
      "#player/kelas6-pai-b06-zakat/zakat"
    );
    expect(buildPlayerHash({ packageId: "kelas1-ipas-b01-tubuh-dan-indera" })).toBe(
      "#player/kelas1-ipas-b01-tubuh-dan-indera"
    );
  });

  it("membaca kembali hash yang ditulis sendiri", () => {
    const selection = { packageId: "kelas3-matematika-b04-pecahan", lessonId: "pecahan" };

    expect(parsePlayerHash(buildPlayerHash(selection))).toEqual(selection);
    expect(parsePlayerHash(`#/${buildPlayerHash(selection).slice(1)}`)).toEqual(selection);
  });

  it("menerima hash paket tanpa lesson dan membuang versi", () => {
    expect(parsePlayerHash("#player/kelas2-pjok-b07-atletik")).toEqual({
      packageId: "kelas2-pjok-b07-atletik"
    });
  });

  it("menolak hash yang bukan deep link Player yang sah", () => {
    expect(parsePlayerHash("")).toBeNull();
    expect(parsePlayerHash("#home")).toBeNull();
    expect(parsePlayerHash("#player")).toBeNull();
    expect(parsePlayerHash("#player/")).toBeNull();
    expect(parsePlayerHash("#player/a/b/c")).toBeNull();
    expect(parsePlayerHash("#player/%E0%A4%A")).toBeNull();
  });
});
