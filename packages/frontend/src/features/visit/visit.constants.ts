export const VISIT_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;

export type VisitStatus = (typeof VISIT_STATUS)[keyof typeof VISIT_STATUS];

export const VISIT_STATUS_OPTIONS = [
  { value: "IN_PROGRESS", label: "В процессе" },
  { value: "COMPLETED", label: "Завершен" },
  { value: "CANCELED", label: "Отменен" },
] as const;

export const VISIT_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "В процессе",
  COMPLETED: "Завершен",
  CANCELED: "Отменен",
};

export const VISIT_STATUS_COLORS: Record<
  string,
  "default" | "success" | "destructive"
> = {
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELED: "destructive",
};
