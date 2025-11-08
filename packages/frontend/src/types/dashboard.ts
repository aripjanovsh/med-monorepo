export interface DashboardStats {
  patients: PatientStats;
  appointments: AppointmentStats;
  revenue: RevenueStats;
  employees: EmployeeStats;
}

export interface PatientStats {
  total: number;
  active: number;
  new: number;
  newThisMonth: number;
  trend: number; // percentage change
  ageDistribution: AgeGroup[];
  genderDistribution: GenderGroup[];
}

export interface AgeGroup {
  range: string;
  count: number;
  percentage: number;
}

export interface GenderGroup {
  gender: "MALE" | "FEMALE" | "OTHER";
  count: number;
  percentage: number;
}

export interface AppointmentStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
  trend: number;
  byStatus: AppointmentStatusGroup[];
  byTime: TimeSlotGroup[];
  recentAppointments: RecentAppointment[];
}

export interface AppointmentStatusGroup {
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  count: number;
  percentage: number;
}

export interface TimeSlotGroup {
  timeSlot: string;
  count: number;
}

export interface RecentAppointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

export interface RevenueStats {
  total: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  trend: number;
  monthlyRevenue: MonthlyRevenue[];
  averagePerPatient: number;
  averagePerAppointment: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  appointments: number;
}

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  doctors: number;
  staff: number;
  performance: EmployeePerformance[];
  workload: EmployeeWorkload[];
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  patientsThisMonth: number;
  appointmentsThisMonth: number;
  rating: number;
  revenue: number;
}

export interface EmployeeWorkload {
  employeeId: string;
  employeeName: string;
  todayAppointments: number;
  weekAppointments: number;
  utilization: number; // percentage
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  color: string;
}

export interface Notification {
  id: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: "APPOINTMENT" | "MEETING" | "REMINDER" | "TASK";
  priority: "LOW" | "MEDIUM" | "HIGH";
  participants?: string[];
}