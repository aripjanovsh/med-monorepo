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

// Employee Quick Stats DTOs (for list page)
export interface EmployeeQuickStatsQueryDto {
  departmentId?: string;
}

export interface EmployeeStatusDistributionDto {
  active: number;
  inactive: number;
  onLeave: number;
  terminated: number;
}

export interface EmployeeDepartmentStatsDto {
  departmentId: string;
  departmentName: string;
  count: number;
}

export interface EmployeeMonthlyTrendDto {
  month: string;
  monthShort: string;
  year: number;
  newEmployees: number;
  terminatedEmployees: number;
}

export interface EmployeeQuickStatsResponseDto {
  total: number;
  activeCount: number;
  newEmployeesThisMonth: number;
  newEmployeesLastMonth: number;
  growthPercent: number;
  statusDistribution: EmployeeStatusDistributionDto;
  byDepartment: EmployeeDepartmentStatsDto[];
  monthlyTrends: EmployeeMonthlyTrendDto[];
}

// Employee Dashboard Stats DTOs (for detail page)
export type StatsPeriod = "week" | "month" | "3months" | "6months" | "year";

export interface EmployeeStatsQueryDto {
  employeeId: string;
  period?: StatsPeriod;
}

export interface VisitStatsDto {
  total: number;
  completed: number;
  canceled: number;
  inProgress: number;
  waiting: number;
}

export interface TimeStatsDto {
  avgServiceTimeMinutes: number;
  avgWaitingTimeMinutes: number;
}

export interface ActivityStatsDto {
  totalServiceOrders: number;
  completedServiceOrders: number;
  totalPrescriptions: number;
  assignedPatients: number;
  newPatientsThisPeriod: number;
}

export interface FinancialStatsDto {
  totalRevenue: number;
  avgRevenuePerVisit: number;
}

export interface EfficiencyStatsDto {
  completionRate: number;
}

export interface ChartDataPointDto {
  label: string;
  completed: number;
  canceled: number;
}

export interface RevenueChartDataPointDto {
  label: string;
  revenue: number;
}

export interface GenderChartDataPointDto {
  label: string;
  male: number;
  female: number;
}

export interface EmployeeStatsResponseDto {
  period: StatsPeriod;
  periodStart: string;
  periodEnd: string;
  visits: VisitStatsDto;
  time: TimeStatsDto;
  activity: ActivityStatsDto;
  financial: FinancialStatsDto;
  efficiency: EfficiencyStatsDto;
  visitsChart: ChartDataPointDto[];
  revenueChart: RevenueChartDataPointDto[];
  genderChart: GenderChartDataPointDto[];
  visitsTrend: number;
  revenueTrend: number;
  efficiencyTrend: number;
}

// Patient Dashboard Stats DTOs
export interface PatientDashboardStatsQueryDto {
  patientId: string;
}

export interface PatientKeyMetricsDto {
  totalVisits: number;
  visitsLastMonth: number;
  activeOrders: number;
  totalDoctors: number;
  activeDoctors: number;
  lastVisitDate?: string;
}

export interface PatientVisitsByMonthDto {
  month: string;
  visits: number;
}

export interface PatientOrdersByStatusDto {
  status: string;
  count: number;
}

export interface PatientVisitsByDepartmentDto {
  department: string;
  visits: number;
}

export interface PatientRecentVisitDto {
  id: string;
  date: string;
  doctor: string;
  department: string;
  status: string;
}

export interface PatientActiveOrderDto {
  id: string;
  name: string;
  department: string;
  status: string;
  date: string;
}

export interface PatientTreatingDoctorDto {
  id: string;
  name: string;
  specialty: string;
  status: string;
}

export interface PatientDashboardStatsResponseDto {
  metrics: PatientKeyMetricsDto;
  visitsByMonth: PatientVisitsByMonthDto[];
  ordersByStatus: PatientOrdersByStatusDto[];
  visitsByDepartment: PatientVisitsByDepartmentDto[];
  recentVisits: PatientRecentVisitDto[];
  activeOrders: PatientActiveOrderDto[];
  treatingDoctors: PatientTreatingDoctorDto[];
}

// Visit Stats DTOs
export interface VisitStatsQueryDto {
  startDate?: string;
  endDate?: string;
}

export interface VisitStatusDistributionDto {
  waiting: number;
  inProgress: number;
  completed: number;
  canceled: number;
  waitingPercent: number;
  inProgressPercent: number;
  completedPercent: number;
  canceledPercent: number;
}

export interface VisitMonthlyTrendDto {
  month: string;
  monthShort: string;
  year: number;
  visitsCount: number;
  completedCount: number;
}

export interface VisitStatsResponseDto {
  totalVisits: number;
  visitsThisMonth: number;
  visitsLastMonth: number;
  growthPercent: number;
  completedVisits: number;
  completionRate: number;
  avgWaitingTimeMinutes: number;
  avgServiceTimeMinutes: number;
  statusDistribution: VisitStatusDistributionDto;
  monthlyTrends: VisitMonthlyTrendDto[];
}
