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
  });

export type Activity = z.infer<typeof activitySchema>;
export type AssessmentConfig = z.infer<typeof assessmentConfigSchema>;
