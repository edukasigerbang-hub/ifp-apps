import { z } from "zod";
import { activityTypes } from "../activityRegistry";
import {
  accessibilityMetadataSchema,
  idSchema,
  runtimeCapabilitySchema,
  safeRelativePathSchema,
  SUPPORTED_SCHEMA_VERSION
} from "./primitives";

const optionSchema = z.strictObject({
  optionId: idSchema,
  text: z.string().min(1).max(500)
});

const responseTypes = ["single-choice", "multiple-choice", "boolean", "text"] as const;

const questionSchema = z
  .strictObject({
    questionId: idSchema,
    prompt: z.string().min(1).max(2000),
    responseType: z.enum(responseTypes),
    options: z.array(optionSchema).min(2).max(12).optional(),
    correctResponse: z.union([z.string().max(500), z.array(z.string().max(500)).min(1).max(12)]).optional()
  })
  .superRefine((question, ctx) => {
    const optionIds = new Set((question.options ?? []).map((option) => option.optionId));

    if (question.responseType === "single-choice") {
      if (!question.options || question.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "single-choice memerlukan minimal 2 opsi",
          path: ["options"],
          input: question.options
        });
      }
      if (typeof question.correctResponse !== "string" || !optionIds.has(question.correctResponse)) {
        ctx.addIssue({
          code: "custom",
          message: "correctResponse harus salah satu optionId",
          path: ["correctResponse"],
          input: question.correctResponse
        });
      }
    }

    if (question.responseType === "multiple-choice") {
      if (!Array.isArray(question.correctResponse) || question.correctResponse.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "multiple-choice memerlukan array correctResponse",
          path: ["correctResponse"],
          input: question.correctResponse
        });
      } else if (!question.correctResponse.every((id) => optionIds.has(id))) {
        ctx.addIssue({
          code: "custom",
          message: "setiap correctResponse harus salah satu optionId",
          path: ["correctResponse"],
          input: question.correctResponse
        });
      }
    }

    if (question.responseType === "boolean" && question.correctResponse !== "true" && question.correctResponse !== "false") {
      ctx.addIssue({
        code: "custom",
        message: "boolean memerlukan correctResponse 'true' atau 'false'",
        path: ["correctResponse"],
        input: question.correctResponse
      });
    }
  });

export const assessmentConfigSchema = z.strictObject({
  questions: z.array(questionSchema).min(1).max(100),
  passingScore: z.number().min(0).max(100).optional()
});

export const completionPolicySchema = z.strictObject({
  type: z.enum(["view", "complete-all", "score-threshold"]),
  threshold: z.number().min(0).max(100).optional()
});

export const feedbackPolicySchema = z.strictObject({
  mode: z.enum(["immediate", "after-attempt", "after-session"]),
  allowRetry: z.boolean(),
  showCorrectAnswer: z.boolean()
});

export const activitySchema = z
  .strictObject({
    activityId: idSchema,
    type: z.enum(activityTypes),
    schemaVersion: z.literal(SUPPORTED_SCHEMA_VERSION),
    title: z.string().min(3).max(200),
    instructions: z.string().min(1).max(2000),
    assets: z.array(safeRelativePathSchema).max(100).default([]),
    interactionConfig: z.record(z.string(), z.unknown()),
    assessmentConfig: assessmentConfigSchema.optional(),
    completionPolicy: completionPolicySchema,
    feedbackPolicy: feedbackPolicySchema,
    runtimeCapabilities: z.array(runtimeCapabilitySchema).max(5).default([]),
    accessibilityMetadata: accessibilityMetadataSchema.optional()
  })
  .superRefine((activity, ctx) => {
    const requiresAssessment = activity.type === "multiple-choice" || activity.type === "true-false" || activity.type === "short-answer";
    if (requiresAssessment && !activity.assessmentConfig) {
      ctx.addIssue({
        code: "custom",
        message: `aktivitas ${activity.type} wajib memiliki assessmentConfig`,
        path: ["assessmentConfig"],
        input: activity.assessmentConfig
      });
    }

    if (activity.completionPolicy.type === "score-threshold" && activity.completionPolicy.threshold === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "score-threshold memerlukan threshold",
        path: ["completionPolicy", "threshold"],
        input: activity.completionPolicy.threshold
      });
    }

    if (activity.type === "matching") {
      const pairs = activity.interactionConfig.pairs;
      if (!Array.isArray(pairs) || pairs.length < 2 || pairs.length > 12) {
        ctx.addIssue({
          code: "custom",
          message: "matching memerlukan interactionConfig.pairs (2–12 pasangan)",
          path: ["interactionConfig", "pairs"],
          input: pairs
        });
        return;
      }
      const seen = new Set<string>();
      pairs.forEach((raw, index) => {
        if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
          ctx.addIssue({
            code: "custom",
            message: "pasangan harus berupa objek",
            path: ["interactionConfig", "pairs", index],
            input: raw
          });
          return;
        }
        const pair = raw as Record<string, unknown>;
        const idResult = idSchema.safeParse(pair.pairId);
        if (!idResult.success) {
          ctx.addIssue({
            code: "custom",
            message: "pairId tidak valid",
            path: ["interactionConfig", "pairs", index, "pairId"],
            input: pair.pairId
          });
        } else if (seen.has(idResult.data)) {
          ctx.addIssue({
            code: "custom",
            message: "pairId duplikat",
            path: ["interactionConfig", "pairs", index, "pairId"],
            input: pair.pairId
          });
        } else {
          seen.add(idResult.data);
        }
        for (const side of ["left", "right"] as const) {
          const value = pair[side];
          if (typeof value !== "string" || value.trim().length === 0 || value.length > 200) {
            ctx.addIssue({
              code: "custom",
              message: `${side} harus 1–200 karakter`,
              path: ["interactionConfig", "pairs", index, side],
              input: value
            });
          }
        }
      });
    }

    if (activity.type === "ordering") {
      const items = activity.interactionConfig.items;
      const correctOrder = activity.interactionConfig.correctOrder;
      if (!Array.isArray(items) || items.length < 2 || items.length > 12) {
        ctx.addIssue({
          code: "custom",
          message: "ordering memerlukan interactionConfig.items (2–12 item)",
          path: ["interactionConfig", "items"],
          input: items
        });
        return;
      }
      const itemIds = new Set<string>();
      items.forEach((raw, index) => {
        if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
          ctx.addIssue({
            code: "custom",
            message: "item harus berupa objek",
            path: ["interactionConfig", "items", index],
            input: raw
          });
          return;
        }
        const item = raw as Record<string, unknown>;
        const idResult = idSchema.safeParse(item.itemId);
        if (!idResult.success) {
          ctx.addIssue({
            code: "custom",
            message: "itemId tidak valid",
            path: ["interactionConfig", "items", index, "itemId"],
            input: item.itemId
          });
        } else if (itemIds.has(idResult.data)) {
          ctx.addIssue({
            code: "custom",
            message: "itemId duplikat",
            path: ["interactionConfig", "items", index, "itemId"],
            input: item.itemId
          });
        } else {
          itemIds.add(idResult.data);
        }
        const text = item.text;
        if (typeof text !== "string" || text.trim().length === 0 || text.length > 200) {
          ctx.addIssue({
            code: "custom",
            message: "text harus 1–200 karakter",
            path: ["interactionConfig", "items", index, "text"],
            input: text
          });
        }
      });
      if (
        !Array.isArray(correctOrder) ||
        correctOrder.length !== items.length ||
        !correctOrder.every(
          (value): value is string => typeof value === "string" && itemIds.has(value)
        ) ||
        new Set(correctOrder).size !== correctOrder.length
      ) {
        ctx.addIssue({
          code: "custom",
          message: "correctOrder harus memuat setiap itemId tepat sekali",
          path: ["interactionConfig", "correctOrder"],
          input: correctOrder
        });
      }
    }
  });

export type Activity = z.infer<typeof activitySchema>;
export type AssessmentConfig = z.infer<typeof assessmentConfigSchema>;
