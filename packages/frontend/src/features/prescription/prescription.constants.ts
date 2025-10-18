// Частота приема препаратов
export const PRESCRIPTION_FREQUENCY_OPTIONS = [
  { value: "1_TIME_DAY", label: "1 раз в день" },
  { value: "2_TIMES_DAY", label: "2 раза в день" },
  { value: "3_TIMES_DAY", label: "3 раза в день" },
  { value: "4_TIMES_DAY", label: "4 раза в день" },
  { value: "EVERY_4_HOURS", label: "Каждые 4 часа" },
  { value: "EVERY_6_HOURS", label: "Каждые 6 часов" },
  { value: "EVERY_8_HOURS", label: "Каждые 8 часов" },
  { value: "EVERY_12_HOURS", label: "Каждые 12 часов" },
  { value: "MORNING", label: "Утром" },
  { value: "EVENING", label: "Вечером" },
  { value: "BEFORE_MEAL", label: "До еды" },
  { value: "AFTER_MEAL", label: "После еды" },
  { value: "AS_NEEDED", label: "По необходимости" },
] as const;

export const PRESCRIPTION_FREQUENCY_LABELS: Record<string, string> = {
  "1_TIME_DAY": "1 раз в день",
  "2_TIMES_DAY": "2 раза в день",
  "3_TIMES_DAY": "3 раза в день",
  "4_TIMES_DAY": "4 раза в день",
  "EVERY_4_HOURS": "Каждые 4 часа",
  "EVERY_6_HOURS": "Каждые 6 часа",
  "EVERY_8_HOURS": "Каждые 8 часов",
  "EVERY_12_HOURS": "Каждые 12 часов",
  "MORNING": "Утром",
  "EVENING": "Вечером",
  "BEFORE_MEAL": "До еды",
  "AFTER_MEAL": "После еды",
  "AS_NEEDED": "По необходимости",
};

// Длительность приема
export const PRESCRIPTION_DURATION_OPTIONS = [
  { value: "3_DAYS", label: "3 дня" },
  { value: "5_DAYS", label: "5 дней" },
  { value: "7_DAYS", label: "7 дней" },
  { value: "10_DAYS", label: "10 дней" },
  { value: "14_DAYS", label: "14 дней" },
  { value: "21_DAY", label: "21 день" },
  { value: "30_DAYS", label: "30 дней" },
  { value: "CONTINUOUS", label: "Постоянно" },
] as const;

export const PRESCRIPTION_DURATION_LABELS: Record<string, string> = {
  "3_DAYS": "3 дня",
  "5_DAYS": "5 дней",
  "7_DAYS": "7 дней",
  "10_DAYS": "10 дней",
  "14_DAYS": "14 дней",
  "21_DAY": "21 день",
  "30_DAYS": "30 дней",
  "CONTINUOUS": "Постоянно",
};

// Маппинг для отображения в списке
export const getFrequencyLabel = (value: string): string => {
  return PRESCRIPTION_FREQUENCY_LABELS[value] || value;
};

export const getDurationLabel = (value: string): string => {
  return PRESCRIPTION_DURATION_LABELS[value] || value;
};
