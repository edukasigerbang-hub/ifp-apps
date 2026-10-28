import { packageContentDigest } from "../content/packageDigest";
import { loadContentPackages } from "../content/loadPackages";
import { validateContentPackage } from "../content/validatePackage";
import { getPackage, type PackageRecord } from "./contentRepository";

type ReviewTarget = Pick<PackageRecord, "packageId" | "version" | "source">;

// Sidik jari harus dihitung dari isi yang benar-benar dimuat aplikasi:
// paket bawaan sudah tervalidasi saat dimuat, paket impor divalidasi dulu di sini
// supaya bentuk objeknya sama dengan yang dipakai checker di repo.
export async function resolvePackageDigest(target: ReviewTarget): Promise<string> {
  if (target.source === "bundled") {
    const { packages } = await loadContentPackages({ includeAssets: false });
    const found = packages.find(
      (entry) =>
        entry.data.manifest.packageId === target.packageId &&
        entry.data.manifest.packageVersion === target.version
    );
    if (!found) {
      throw new Error(
        `Isi paket bawaan ${target.packageId} v${target.version} tidak ditemukan di bundel.`
      );
    }
    return packageContentDigest(found.data);
  }

  const managed = await getPackage(target.packageId, target.version);
  const validated = validateContentPackage({
    manifest: managed.manifest,
    lessons: managed.lessons,
    activities: managed.activities
  });
  if (!validated.ok || !validated.data) {
    throw new Error(
      `Isi paket ${target.packageId} v${target.version} tidak dapat divalidasi sehingga sidik jarinya tidak dapat dihitung.`
    );
  }
  return packageContentDigest(validated.data);
}
