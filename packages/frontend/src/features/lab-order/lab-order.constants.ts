export const LAB_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type LabStatus = (typeof LAB_STATUS)[keyof typeof LAB_STATUS];

export const LAB_STATUS_OPTIONS = [
  { value: "PENDING", label: "Ожидание" },
  { value: "IN_PROGRESS", label: "В процессе" },
  { value: "COMPLETED", label: "Завершено" },
] as const;

export const LAB_STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидание",
  IN_PROGRESS: "В процессе",
  COMPLETED: "Завершено",
};

export const LAB_STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "success"
> = {
  PENDING: "default",
  IN_PROGRESS: "secondary",
  COMPLETED: "success",
};
