import { z } from "zod";
import {
  accessibilityMetadataSchema,
  curriculumRefSchema,
  idSchema,
  safeRelativePathSchema,
  semverSchema
} from "./primitives";

export const contentReviewStates = ["draft", "reviewed", "approved"] as const;

export const lessonSchema = z
  .strictObject({
    lessonId: idSchema,
    packageId: idSchema,
    title: z.string().min(3).max(200),
    summary: z.string().min(1).max(500),
    curriculumRefs: z.array(curriculumRefSchema).max(24).default([]),
    learningObjectives: z.array(z.string().min(1).max(300)).min(1).max(20),
    activityIds: z.array(idSchema).min(1).max(50),
    assessmentRefs: z.array(idSchema).max(50).default([]),
    assetRefs: z.array(safeRelativePathSchema).max(200).default([]),
    accessibilityMetadata: accessibilityMetadataSchema.optional(),
    contentVersion: semverSchema,
    reviewStatus: z.enum(contentReviewStates)
  })
  .superRefine((lesson, ctx) => {
    const seen = new Set<string>();
    lesson.activityIds.forEach((activityId, index) => {
      if (seen.has(activityId)) {
        ctx.addIssue({
          code: "custom",
          message: `activityId duplikat: ${activityId}`,
          path: ["activityIds", index],
          input: activityId
        });
      }
      seen.add(activityId);
    });
  });

export type Lesson = z.infer<typeof lessonSchema>;
