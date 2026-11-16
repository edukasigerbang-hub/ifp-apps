import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const APPLY = process.argv.includes('--apply');
const PACKAGE_ROOT = path.join('content', 'packages');
const MATERI_ROOT = path.join('content', 'materi');

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const packages = fs
  .readdirSync(PACKAGE_ROOT)
  .filter((dir) => /^kelas[1-6]-/.test(dir))
  .sort();

const summary = { updated: 0, skipped: 0, missingSource: 0, extraRefs: 0 };
const problems = [];

for (const dir of packages) {
  const grade = /^kelas([1-6])-/.exec(dir)[1];
  const packageDir = path.join(PACKAGE_ROOT, dir);
  const manifestPath = path.join(packageDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    summary.skipped += 1;
    continue;
  }

  const source = path.join(MATERI_ROOT, `kelas${grade}`, `${dir}.webp`);
  if (!fs.existsSync(source)) {
    summary.missingSource += 1;
    problems.push(`missing source: ${source}`);
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const imageAssets = (manifest.assets ?? []).filter((asset) => String(asset.mediaType).startsWith('image/'));
  if (imageAssets.length !== 1) {
    summary.skipped += 1;
    problems.push(`expected exactly 1 image asset in ${dir}, found ${imageAssets.length}`);
    continue;
  }

  const asset = imageAssets[0];
  const oldPath = asset.path;
  const newPath = `${oldPath.replace(/\.[^.]+$/, '')}.webp`;
  const newAbs = path.join(packageDir, newPath);
  const oldAbs = path.join(packageDir, oldPath);

  if (APPLY) {
    fs.mkdirSync(path.dirname(newAbs), { recursive: true });
    fs.copyFileSync(source, newAbs);
    asset.path = newPath;
    asset.mediaType = 'image/webp';
    asset.sizeBytes = fs.statSync(newAbs).size;
    asset.sha256 = sha256(newAbs);
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const jsonFiles = [
      ...fs.readdirSync(path.join(packageDir, 'lessons')).map((f) => path.join(packageDir, 'lessons', f)),
      ...fs.readdirSync(path.join(packageDir, 'activities')).map((f) =>
        path.join(packageDir, 'activities', f)
      )
    ];
    for (const file of jsonFiles) {
      const text = fs.readFileSync(file, 'utf8');
      if (!text.includes(oldPath)) continue;
      fs.writeFileSync(file, text.split(oldPath).join(newPath));
      summary.extraRefs += 1;
    }

    if (oldPath !== newPath && fs.existsSync(oldAbs)) fs.rmSync(oldAbs);
  }

  summary.updated += 1;
}

console.log(`${APPLY ? 'APPLIED' : 'DRY RUN'}:`, JSON.stringify(summary));
if (problems.length) {
  console.log('problems:');
  for (const problem of problems) console.log(' -', problem);
  process.exitCode = 1;
}
