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

export interface ContentLoadOptions {
  includeAssets?: boolean;
}

function packageDirOf(path: string): string {
  return path.slice(0, path.lastIndexOf("/"));
}

const catalogCache = { promise: null as Promise<ContentLoadResult> | null };
const fullCache = { promise: null as Promise<ContentLoadResult> | null };

async function loadUncached(includeAssets: boolean): Promise<ContentLoadResult> {
  const { manifestModules, lessonModules, activityModules, assetModules } = await import(
    "./packageModules"
  );

  const directories = [...new Set(Object.keys(manifestModules).map(packageDirOf))].sort();
  const lessonPaths = Object.keys(lessonModules).sort();
  const activityPaths = Object.keys(activityModules).sort();
  const assetPaths = includeAssets ? Object.keys(assetModules).sort() : [];

  const [manifests, lessons, activities, assetUrls] = await Promise.all([
    Promise.all(directories.map((dir) => manifestModules[`${dir}/manifest.json`]())),
    Promise.all(lessonPaths.map((path) => lessonModules[path]())),
    Promise.all(activityPaths.map((path) => activityModules[path]())),
    Promise.all(assetPaths.map((path) => assetModules[path]()))
  ]);

  const lessonsByDir = new Map<string, unknown[]>();
  lessonPaths.forEach((path, index) => {
    const dir = packageDirOf(path);
    const list = lessonsByDir.get(dir) ?? [];
    list.push(lessons[index]);
    lessonsByDir.set(dir, list);
  });

  const activitiesByDir = new Map<string, unknown[]>();
  activityPaths.forEach((path, index) => {
    const dir = packageDirOf(path);
    const list = activitiesByDir.get(dir) ?? [];
    list.push(activities[index]);
    activitiesByDir.set(dir, list);
  });

  const assetUrlsByPath = new Map<string, string>();
  assetPaths.forEach((path, index) => {
    assetUrlsByPath.set(path, assetUrls[index] as string);
  });

  const packages: LoadedContentPackage[] = [];
  const errors: ContentLoadError[] = [];

  directories.forEach((dir, index) => {
    const result = validateContentPackage({
      manifest: manifests[index],
      lessons: lessonsByDir.get(dir) ?? [],
      activities: activitiesByDir.get(dir) ?? []
    });
    if (!result.ok || !result.data) {
      errors.push({ packageDir: dir, issues: result.issues });
      return;
    }

    const assets: Record<string, string> = {};
    if (includeAssets) {
      for (const [path, url] of assetUrlsByPath) {
        if (path.startsWith(`${dir}/assets/`)) {
          assets[path.slice(dir.length + 1)] = url;
        }
      }
    }

    packages.push({ data: result.data, assets });
  });

  return { packages, errors };
}

export async function loadContentPackages(
  options: ContentLoadOptions = {}
): Promise<ContentLoadResult> {
  const includeAssets = options.includeAssets ?? true;
  const cache = includeAssets ? fullCache : catalogCache;
  if (!cache.promise) {
    cache.promise = loadUncached(includeAssets).catch((error) => {
      cache.promise = null;
      throw error;
    });
  }
  return cache.promise;
}
