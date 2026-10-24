import type { GradedOutcome } from "./graded";
import type { Activity } from "./schema/activity";

export interface MatchingPair {
  pairId: string;
  left: string;
  right: string;
}

export interface OrderingItem {
  itemId: string;
  text: string;
}

export function readMatchingPairs(activity: Activity): MatchingPair[] {
  const pairs = activity.interactionConfig.pairs;
  if (!Array.isArray(pairs)) return [];
  return pairs
    .filter(
      (pair): pair is Record<string, unknown> =>
        typeof pair === "object" && pair !== null && !Array.isArray(pair)
    )
    .map((pair) => ({
      pairId: String(pair.pairId ?? ""),
      left: String(pair.left ?? ""),
      right: String(pair.right ?? "")
    }))
    .filter((pair) => pair.pairId.length > 0);
}

export function readOrdering(activity: Activity): {
  items: OrderingItem[];
  correctOrder: string[];
} {
  const items = activity.interactionConfig.items;
  const correctOrder = activity.interactionConfig.correctOrder;
  const parsedItems = Array.isArray(items)
    ? items
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null && !Array.isArray(item)
        )
        .map((item) => ({
          itemId: String(item.itemId ?? ""),
          text: String(item.text ?? "")
        }))
        .filter((item) => item.itemId.length > 0)
    : [];
  return {
    items: parsedItems,
    correctOrder: Array.isArray(correctOrder)
      ? correctOrder.filter((value): value is string => typeof value === "string")
      : []
  };
}

export function scoreMatching(
  pairs: MatchingPair[],
  selections: Readonly<Record<string, string>>
): GradedOutcome {
  const answers = pairs.map((pair) => {
    const selected = selections[pair.pairId];
    return {
      questionId: pair.pairId,
      optionId: selected ?? null,
      responseText: null,
      isCorrect: selected === pair.pairId
    };
  });
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const score = pairs.length === 0 ? 0 : Math.round((correct / pairs.length) * 100);
  return { score, answers };
}

export function scoreOrdering(
  items: OrderingItem[],
  order: readonly string[],
  correctOrder: readonly string[]
): GradedOutcome {
  const expected = new Map(correctOrder.map((itemId, index) => [itemId, index]));
  const answers = order.map((itemId, index) => ({
    questionId: itemId,
    optionId: `pos-${index + 1}`,
    responseText: null,
    isCorrect: expected.get(itemId) === index
  }));
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const total = items.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { score, answers };
}
