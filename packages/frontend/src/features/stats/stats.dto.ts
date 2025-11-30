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

// Patient Stats DTOs
export interface PatientStatsQueryDto {
  startDate?: string;
  endDate?: string;
}

export interface GenderDistributionDto {
  male: number;
  female: number;
  malePercent: number;
  femalePercent: number;
}

export interface AgeGroupDto {
  label: string;
  minAge: number;
  maxAge: number | null;
  count: number;
  percent: number;
}

export interface MonthlyTrendDto {
  month: string;
  monthShort: string;
  year: number;
  newPatients: number;
  visits: number;
}

export interface PatientStatsResponseDto {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  newPatientsLastMonth: number;
  growthPercent: number;
  genderDistribution: GenderDistributionDto;
  ageDistribution: AgeGroupDto[];
  returningPatients: number;
  returningPatientsPercent: number;
  monthlyTrends: MonthlyTrendDto[];
}

// Invoice Stats DTOs
export interface InvoiceStatsQueryDto {
  startDate?: string;
  endDate?: string;
}

export interface PaymentStatusDistributionDto {
  unpaid: number;
  partiallyPaid: number;
  paid: number;
  unpaidPercent: number;
  partiallyPaidPercent: number;
  paidPercent: number;
}

export interface PaymentMethodDistributionDto {
  method: string;
  count: number;
  amount: number;
  percent: number;
}

export interface InvoiceMonthlyTrendDto {
  month: string;
  monthShort: string;
  year: number;
  invoicesCount: number;
  revenue: number;
}

export interface InvoiceStatsResponseDto {
  totalInvoices: number;
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  growthPercent: number;
  averageInvoiceAmount: number;
  statusDistribution: PaymentStatusDistributionDto;
  paymentMethodDistribution: PaymentMethodDistributionDto[];
  monthlyTrends: InvoiceMonthlyTrendDto[];
}
