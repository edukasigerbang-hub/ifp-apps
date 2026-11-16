export interface ExplorationStepLike {
  prompt: string;
  assetPath?: string;
}

// Paket biasanya memakai satu ilustrasi untuk seluruh langkah, sehingga gambar yang sama
// dirender ulang di setiap langkah. Deteksi kasus itu agar gambar bisa ditampilkan sekali saja.
export function sharedStepAsset(steps: ExplorationStepLike[]): string | null {
  if (steps.length === 0) {
    return null;
  }
  const first = steps[0].assetPath;
  if (!first) {
    return null;
  }
  return steps.every((step) => step.assetPath === first) ? first : null;
}
