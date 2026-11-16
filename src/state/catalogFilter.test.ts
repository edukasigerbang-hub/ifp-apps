import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCatalogFilter,
  getCatalogFilter,
  setCatalogFilter
} from "./catalogFilter";

describe("permintaan filter katalog", () => {
  beforeEach(() => {
    clearCatalogFilter();
  });

  it("membaca permintaan berulang kali tanpa kehilangan nilai", () => {
    setCatalogFilter({ subject: "matematika" });
    expect(getCatalogFilter()).toEqual({ subject: "matematika" });
    expect(getCatalogFilter()).toEqual({ subject: "matematika" });
  });

  it("pembersihan membuat permintaan berikutnya kosong", () => {
    setCatalogFilter({ subject: "ipas", grade: 4 });
    clearCatalogFilter();
    expect(getCatalogFilter()).toBeNull();
  });
});
