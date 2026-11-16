/**
 * Detektor F-06: pasangan matching yang masih bisa dijawab dengan menyalin langkah eksplorasi.
 * Aturan token sengaja disamakan dengan pengukuran T-100 agar angka 309 pasangan / 160 paket
 * (F06_MIRROR_PAIRS_2026-10-28.csv) dapat direproduksi persis.
 */
const EDGE_PUNCTUATION = /^[.,!?;:"'()[\]\u2026]+|[.,!?;:"'()[\]\u2026]+$/g;

export const MIRROR_THRESHOLD = 0.7;

export function normalizePairText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pairTokens(value) {
  const tokens = new Set();
  for (const word of String(value ?? "").normalize("NFKC").toLowerCase().split(/\s+/)) {
    const stripped = word.replace(EDGE_PUNCTUATION, "");
    if (stripped.length >= 3) tokens.add(stripped);
  }
  return tokens;
}

export function detectExplorationCopies(activities, { threshold = MIRROR_THRESHOLD } = {}) {
  const steps = activities
    .filter((activity) => activity.type === "exploration")
    .flatMap((activity) => activity.interactionConfig?.steps ?? []);
  const copies = [];
  for (const activity of activities) {
    if (activity.type !== "matching") continue;
    for (const pair of activity.interactionConfig?.pairs ?? []) {
      const right = normalizePairText(pair.right);
      if (right === "") continue;
      const left = pairTokens(pair.left);
      if (left.size === 0) continue;
      for (const step of steps) {
        if (normalizePairText(step.reveal) !== right) continue;
        const prompt = pairTokens(step.prompt);
        if (prompt.size === 0) continue;
        let shared = 0;
        for (const token of left) if (prompt.has(token)) shared += 1;
        const overlap = Math.min(shared / left.size, shared / prompt.size);
        if (overlap >= threshold) {
          copies.push({
            activityId: activity.activityId,
            pairId: pair.pairId,
            left: pair.left,
            right: pair.right,
            explorationPrompt: step.prompt,
            wordOverlap: Number(overlap.toFixed(2))
          });
        }
        break;
      }
    }
  }
  return copies;
}
