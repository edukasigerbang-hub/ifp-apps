import { validateContentPackage, type ContentIssue, type ContentPackage } from "./validatePackage";

const manifestModules = import.meta.glob("../../content/packages/*/manifest.json", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

const lessonModules = import.meta.glob("../../content/packages/*/lessons/*.json", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

const activityModules = import.meta.glob("../../content/packages/*/activities/*.json", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

const assetModules = import.meta.glob("../../content/packages/*/assets/*", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

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

function filesIn(dir: string, modules: Record<string, unknown>, subdirectory: string): unknown[] {
  return Object.entries(modules)
    .filter(([path]) => path.startsWith(`${dir}/${subdirectory}/`))
    .map(([, value]) => value);
}

export function loadContentPackages(): ContentLoadResult {
  const directories = [...new Set(Object.keys(manifestModules).map(packageDirOf))].sort();
  const packages: LoadedContentPackage[] = [];
  const errors: ContentLoadError[] = [];

  for (const dir of directories) {
    const input = {
      manifest: manifestModules[`${dir}/manifest.json`],
      lessons: filesIn(dir, lessonModules, "lessons"),
      activities: filesIn(dir, activityModules, "activities")
    };

    const result = validateContentPackage(input);
    if (!result.ok || !result.data) {
      errors.push({ packageDir: dir, issues: result.issues });
      continue;
    }

    const assets: Record<string, string> = {};
    for (const [path, url] of Object.entries(assetModules)) {
      if (path.startsWith(`${dir}/assets/`)) {
        assets[path.slice(dir.length + 1)] = url;
      }
    }

    packages.push({ data: result.data, assets });
  }

  return { packages, errors };
}
