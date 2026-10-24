import { describe, expect, it } from "vitest";
import {
  readMatchingPairs,
  readOrdering,
  scoreMatching,
  scoreOrdering,
  type MatchingPair,
  type OrderingItem
} from "../interactions";
import type { Activity } from "../schema/activity";

function activity(type: Activity["type"], interactionConfig: Record<string, unknown>): Activity {
  return {
    activityId: "aktivitas-uji",
    type,
    schemaVersion: "1.0.0",
    title: "Aktivitas Uji",
    instructions: "Ikuti instruksi.",
    assets: [],
    interactionConfig,
    completionPolicy: { type: "score-threshold", threshold: 100 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: [],
    accessibilityMetadata: undefined
  } as Activity;
}

describe("matching", () => {
  const pairs: MatchingPair[] = [
    { pairId: "pasangan-1", left: "1/2", right: "Setengah" },
    { pairId: "pasangan-2", left: "1/4", right: "Seperempat" }
  ];

  it("membaca pasangan dari interactionConfig", () => {
    expect(readMatchingPairs(activity("matching", { pairs }))).toEqual(pairs);
  });

  it("memberi 100 saat semua pasangan benar", () => {
    const outcome = scoreMatching(pairs, { "pasangan-1": "pasangan-1", "pasangan-2": "pasangan-2" });
    expect(outcome.score).toBe(100);
    expect(outcome.answers.every((answer) => answer.isCorrect)).toBe(true);
  });

  it("menilai sebagian dan menandai yang salah", () => {
    const outcome = scoreMatching(pairs, { "pasangan-1": "pasangan-1", "pasangan-2": "pasangan-1" });
    expect(outcome.score).toBe(50);
    expect(outcome.answers.filter((answer) => answer.isCorrect)).toHaveLength(1);
  });

  it("menolak pasangan kosong", () => {
    expect(readMatchingPairs(activity("matching", { pairs: [] }))).toEqual([]);
  });
});

describe("ordering", () => {
  const items: OrderingItem[] = [
    { itemId: "angka-1", text: "Angka 1" },
    { itemId: "angka-2", text: "Angka 2" },
    { itemId: "angka-3", text: "Angka 3" }
  ];
  const correctOrder = ["angka-1", "angka-2", "angka-3"];

  it("membaca item dan correctOrder", () => {
    expect(readOrdering(activity("ordering", { items, correctOrder }))).toEqual({
      items,
      correctOrder
    });
  });

  it("memberi 100 untuk urutan tepat", () => {
    const outcome = scoreOrdering(items, correctOrder, correctOrder);
    expect(outcome.score).toBe(100);
  });

  it("menilai posisi yang benar saja", () => {
    const outcome = scoreOrdering(items, ["angka-2", "angka-1", "angka-3"], correctOrder);
    expect(outcome.score).toBe(33);
    expect(outcome.answers.find((answer) => answer.questionId === "angka-3")?.isCorrect).toBe(true);
  });

  it("mengabaikan item yang tidak ada di correctOrder", () => {
    const outcome = scoreOrdering(items, ["asing", "angka-1", "angka-2"], correctOrder);
    expect(outcome.answers.find((answer) => answer.questionId === "asing")?.isCorrect).toBe(false);
  });
});
