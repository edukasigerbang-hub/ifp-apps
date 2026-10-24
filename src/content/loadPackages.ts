import { validateContentPackage, type ContentIssue, type ContentPackage } from "./validatePackage";

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
  const { manifestModules, lessonModules, activityModules, assetModules } = await import(
    "./packageModules"
  );
  const directories = [...new Set(Object.keys(manifestModules).map(packageDirOf))].sort();
  const manifests = await Promise.all(
    directories.map((dir) => manifestModules[`${dir}/manifest.json`]())
  );
  const packages: LoadedContentPackage[] = [];
  const errors: ContentLoadError[] = [];

  for (const [index, dir] of directories.entries()) {
    const lessonEntries = entriesIn(dir, lessonModules, "lessons");
    const activityEntries = entriesIn(dir, activityModules, "activities");
    const assetEntries = entriesIn(dir, assetModules, "assets");

    const [lessons, activities, assetUrls] = await Promise.all([
      Promise.all(lessonEntries.map(([, load]) => load())),
      Promise.all(activityEntries.map(([, load]) => load())),
      Promise.all(assetEntries.map(([, load]) => load()))
    ]);

    const result = validateContentPackage({
      manifest: manifests[index],
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
