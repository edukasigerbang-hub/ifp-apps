import { validateContentPackage, type ContentIssue, type ContentPackage } from "./validatePackage";

const manifestModules = import.meta.glob("../../content/packages/*/manifest.json", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

const lessonModules = import.meta.glob("../../content/packages/*/lessons/*.json", {
  import: "default"
}) as Record<string, () => Promise<unknown>>;

const activityModules = import.meta.glob("../../content/packages/*/activities/*.json", {
  import: "default"
}) as Record<string, () => Promise<unknown>>;

const assetModules = import.meta.glob("../../content/packages/*/assets/*", {
  query: "?url",
  import: "default"
}) as Record<string, () => Promise<string>>;

export interface LoadedContentPackage {
  data: ContentPackage;
  assets: Record<string, string>;
}

export interface ContentLoadError {
  packageDir: string;
  issues: ContentIssue[];
}

export interface ContentLoadResult {
  packages: LoadedContentPackage[];
  errors: ContentLoadError[];
}

function packageDirOf(path: string): string {
  return path.slice(0, path.lastIndexOf("/"));
}

function entriesIn<T>(dir: string, modules: Record<string, T>, subdirectory: string): Array<[string, T]> {
  return Object.entries(modules).filter(([path]) => path.startsWith(`${dir}/${subdirectory}/`));
}

export async function loadContentPackages(): Promise<ContentLoadResult> {
  const directories = [...new Set(Object.keys(manifestModules).map(packageDirOf))].sort();
  const packages: LoadedContentPackage[] = [];
  const errors: ContentLoadError[] = [];

  for (const dir of directories) {
    const lessonEntries = entriesIn(dir, lessonModules, "lessons");
    const activityEntries = entriesIn(dir, activityModules, "activities");
    const assetEntries = entriesIn(dir, assetModules, "assets");

    const [lessons, activities, assetUrls] = await Promise.all([
      Promise.all(lessonEntries.map(([, load]) => load())),
      Promise.all(activityEntries.map(([, load]) => load())),
      Promise.all(assetEntries.map(([, load]) => load()))
    ]);

    const result = validateContentPackage({
      manifest: manifestModules[`${dir}/manifest.json`],
      lessons,
      activities
    });
    if (!result.ok || !result.data) {
      errors.push({ packageDir: dir, issues: result.issues });
      continue;
    }

    const assets: Record<string, string> = {};
    assetEntries.forEach(([path], index) => {
      assets[path.slice(dir.length + 1)] = assetUrls[index];
    });

    packages.push({ data: result.data, assets });
  }

  return { packages, errors };
}
