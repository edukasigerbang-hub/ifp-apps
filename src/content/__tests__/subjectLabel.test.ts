import { describe, expect, it } from "vitest";
import { subjectLabel } from "../subjectLabel";

describe("subjectLabel", () => {
  it("memetakan slug mata pelajaran ke label yang benar", () => {
    expect(subjectLabel("bahasa-indonesia")).toBe("Bahasa Indonesia");
    expect(subjectLabel("pendidikan-pancasila")).toBe("Pendidikan Pancasila");
    expect(subjectLabel("seni-rupa")).toBe("Seni Rupa");
    expect(subjectLabel("pai")).toBe("PAI");
    expect(subjectLabel("pjok")).toBe("PJOK");
    expect(subjectLabel("ipas")).toBe("IPAS");
    expect(subjectLabel("matematika")).toBe("Matematika");
  });

  it("menormalkan huruf besar dan spasi", () => {
    expect(subjectLabel(" PAI ")).toBe("PAI");
  });

  it("membentuk label dari slug yang belum dikenal", () => {
    expect(subjectLabel("bahasa-inggris")).toBe("Bahasa Inggris");
  });
});
