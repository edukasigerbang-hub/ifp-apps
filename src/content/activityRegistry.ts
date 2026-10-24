export const activityTypes = [
  "multiple-choice",
  "true-false",
  "matching",
  "ordering",
  "short-answer",
  "exploration"
] as const;

export type ActivityType = (typeof activityTypes)[number];

interface ActivityTypeDefinition {
  readonly requiresAssessment: boolean;
  readonly description: string;
}

export const activityTypeRegistry: Record<ActivityType, ActivityTypeDefinition> = {
  "multiple-choice": {
    requiresAssessment: true,
    description: "Pilihan ganda dengan satu atau banyak jawaban benar"
  },
  "true-false": {
    requiresAssessment: true,
    description: "Pernyataan benar atau salah"
  },
  matching: {
    requiresAssessment: false,
    description: "Memasangkan pasangan yang sesuai"
  },
  ordering: {
    requiresAssessment: false,
    description: "Mengurutkan langkah atau objek"
  },
  "short-answer": {
    requiresAssessment: true,
    description: "Jawaban singkat yang dapat dinilai otomatis atau direview"
  },
  exploration: {
    requiresAssessment: false,
    description: "Eksplorasi terbuka tanpa skor otomatis"
  }
};

export function isSupportedActivityType(value: string): value is ActivityType {
  return Object.prototype.hasOwnProperty.call(activityTypeRegistry, value);
}
