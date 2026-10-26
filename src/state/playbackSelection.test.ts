import { beforeEach, describe, expect, it } from "vitest";
import { getPlaybackSelection, setPlaybackSelection } from "./playbackSelection";

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
