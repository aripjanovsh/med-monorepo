"use client";

// Dashboard components
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { EmployeePerformancePanel } from "@/components/dashboard/employee-performance";

// Mock data
import {
  mockDashboardStats,
  quickActions,
  notifications,
  upcomingEvents,
} from "@/data/dashboard";

export default function DashboardPageClient() {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good morning! 👋
          </h1>
          <p className="text-muted-foreground">
            {currentDate} • {currentTime}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {mockDashboardStats.appointments.today} appointments today
          </p>
          <p className="text-sm text-muted-foreground">
            {mockDashboardStats.patients.active} active patients
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={mockDashboardStats} />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <RevenueChart
            data={mockDashboardStats.revenue.monthlyRevenue}
            trend={mockDashboardStats.revenue.trend}
            totalRevenue={mockDashboardStats.revenue.thisMonth}
          />

          {/* Employee Performance */}
          <EmployeePerformancePanel
            performance={mockDashboardStats.employees.performance}
            workload={mockDashboardStats.employees.workload}
          />

          {/* Recent Appointments */}
          <RecentAppointments
            appointments={mockDashboardStats.appointments.recentAppointments}
          />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Notifications */}
          <NotificationsPanel notifications={notifications} />

          {/* Upcoming Events */}
          <UpcomingEvents events={upcomingEvents} />
        </div>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Patient Demographics */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Patient Demographics
          </h3>
          <div className="space-y-3">
            {mockDashboardStats.patients.ageDistribution.map((group, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{group.range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {group.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Appointment Status
          </h3>
          <div className="space-y-3">
            {mockDashboardStats.appointments.byStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status.status}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{status.count}</span>
                  <span className="text-xs text-gray-500">
                    ({status.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Treatments */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Popular Treatments
          </h3>
          <div className="space-y-3">
            {mockDashboardStats.treatments.popular
              .slice(0, 4)
              .map((treatment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">
                    {treatment.treatmentName}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {treatment.count}
                    </span>
                    <span className="text-xs text-green-600">
                      +{treatment.trend}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Revenue by Category
          </h3>
          <div className="space-y-3">
            {mockDashboardStats.treatments.byCategory
              .slice(0, 4)
              .map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {category.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      ${category.revenue.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({category.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
