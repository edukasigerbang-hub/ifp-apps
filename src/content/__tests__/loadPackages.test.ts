import { describe, expect, it } from "vitest";
import { packageDirOf } from "../loadPackages";

describe("packageDirOf", () => {
  it("memetakan manifest, lesson, dan activity ke direktori paket yang sama", () => {
    const dir = "../../content/packages/kelas1-pai-b08-adab";
    expect(packageDirOf(`${dir}/manifest.json`)).toBe(dir);
    expect(packageDirOf(`${dir}/lessons/lesson-001.json`)).toBe(dir);
    expect(packageDirOf(`${dir}/activities/activity-001.json`)).toBe(dir);
  });
});
