export const manifestModules = import.meta.glob("../../content/packages/*/manifest.json", {
  import: "default"
}) as Record<string, () => Promise<unknown>>;

export const lessonModules = import.meta.glob("../../content/packages/*/lessons/*.json", {
  import: "default"
}) as Record<string, () => Promise<unknown>>;

export const activityModules = import.meta.glob("../../content/packages/*/activities/*.json", {
  import: "default"
}) as Record<string, () => Promise<unknown>>;

export const assetModules = import.meta.glob("../../content/packages/*/assets/*", {
  query: "?url",
  import: "default"
}) as Record<string, () => Promise<string>>;
