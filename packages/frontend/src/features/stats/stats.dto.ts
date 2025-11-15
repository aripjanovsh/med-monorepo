export enum StatsType {
  PATIENTS_COUNT = "PATIENTS_COUNT",
  VISITS_COUNT = "VISITS_COUNT",
  APPOINTMENTS_COUNT = "APPOINTMENTS_COUNT",
  REVENUE_TOTAL = "REVENUE_TOTAL",
  UNPAID_INVOICES_COUNT = "UNPAID_INVOICES_COUNT",
  PATIENTS_IN_QUEUE = "PATIENTS_IN_QUEUE",
  COMPLETED_VISITS = "COMPLETED_VISITS",
  CANCELED_APPOINTMENTS = "CANCELED_APPOINTMENTS",
  NO_SHOW_APPOINTMENTS = "NO_SHOW_APPOINTMENTS",
}

export interface StatsQueryDto {
  types?: StatsType[];
  startDate?: string;
  endDate?: string;
}

export interface StatsResponseDto {
  startDate: string;
  endDate: string;
  stats: Record<StatsType, number>;
}
