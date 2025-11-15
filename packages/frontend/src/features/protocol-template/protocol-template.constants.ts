export const STATUS_OPTIONS = [
  { value: "true", label: "Активен" },
  { value: "false", label: "Неактивен" },
] as const;

export const STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export type ProtocolTemplateStatus = (typeof STATUS)[keyof typeof STATUS];

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;
