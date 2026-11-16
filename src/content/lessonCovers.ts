const bundledAssetUrls = import.meta.glob("../../content/packages/*/assets/*", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

export function bundledCoverUrl(packageId: string, coverAsset: string | null): string | null {
  if (!coverAsset) return null;
  return bundledAssetUrls[`../../content/packages/${packageId}/${coverAsset}`] ?? null;
}

export function imageMediaTypeOf(path: string): string {
  const extension = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return "image/webp";
}
