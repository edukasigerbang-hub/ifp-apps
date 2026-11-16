import { describe, expect, it } from "vitest";
import {
  DEFAULT_APP_MODE,
  isAppMode,
  isScreenAllowedInMode,
  navigationItemsForMode,
  studentNavigationItems
} from "./navigation";

describe("mode aplikasi", () => {
  it("mode admin memakai seluruh navigasi", () => {
    expect(navigationItemsForMode("admin")).toHaveLength(9);
  });

  it("mode belajar memuat empat tujuan belajar tanpa Player dan panel kelola", () => {
    expect(studentNavigationItems.map((item) => item.id)).toEqual([
      "home",
      "curriculum",
      "activities",
      "results"
    ]);
    expect(navigationItemsForMode("belajar")).toBe(studentNavigationItems);
  });

  it("mode belajar menolak layar kelola tetapi mengizinkan Player dari materi", () => {
    expect(isScreenAllowedInMode("belajar", "home")).toBe(true);
    expect(isScreenAllowedInMode("belajar", "player")).toBe(true);
    expect(isScreenAllowedInMode("belajar", "content")).toBe(false);
    expect(isScreenAllowedInMode("belajar", "studio")).toBe(false);
    expect(isScreenAllowedInMode("belajar", "license")).toBe(false);
    expect(isScreenAllowedInMode("belajar", "settings")).toBe(false);
    expect(isScreenAllowedInMode("admin", "settings")).toBe(true);
    expect(isScreenAllowedInMode("admin", "studio")).toBe(true);
  });

  it("hanya menerima nilai mode yang dikenal", () => {
    expect(isAppMode("belajar")).toBe(true);
    expect(isAppMode("admin")).toBe(true);
    expect(isAppMode("siswa")).toBe(false);
    expect(isAppMode(undefined)).toBe(false);
    expect(DEFAULT_APP_MODE).toBe("admin");
  });
});
