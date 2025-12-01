"use client";

import { useState } from "react";
import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import type { StatsPeriod } from "@/features/stats/stats.dto";
import { useGetEmployeeDashboardStatsQuery } from "@/features/stats/stats.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Activity,
  FileText,
  Pill,
  DollarSign,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { OptionSwitcher } from "@/components/ui/option-switcher";
import { formatCurrencyCompact } from "@/lib/currency.utils";

type EmployeeOverviewProps = {
  employee: EmployeeResponseDto;
};

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "3months", label: "3 месяца" },
  { value: "6months", label: "6 месяцев" },
  { value: "year", label: "Год" },
];

const formatNumber = (value: number): string => {
  return value.toLocaleString("ru-RU");
};

type TrendProps = {
  value: number;
  suffix?: string;
};

const TrendIndicator = ({ value, suffix = "%" }: TrendProps) => {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3 mr-0.5" />
      ) : (
        <ArrowDownRight className="h-3 w-3 mr-0.5" />
      )}
      {Math.abs(value)}
      {suffix}
    </span>
  );
};

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  trendSuffix?: string;
  iconColor?: string;
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendSuffix,
  iconColor = "text-primary",
  isLoading = false,
}: StatCardProps & { isLoading?: boolean }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend !== undefined && (
                <TrendIndicator value={trend} suffix={trendSuffix} />
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const formatPeriodLabel = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return `${startDate.toLocaleDateString("ru-RU", options)} — ${endDate.toLocaleDateString("ru-RU", options)}`;
};

export function EmployeeOverview({ employee }: EmployeeOverviewProps) {
  const [period, setPeriod] = useState<StatsPeriod>("month");

  const { data: stats, isLoading } = useGetEmployeeDashboardStatsQuery({
    employeeId: employee.id,
    period,
  });

  const handlePeriodChange = (value: string) => {
    if (value) {
      setPeriod(value as StatsPeriod);
    }
  };

  // Transform chart data for the component
  const visitsChartData =
    stats?.visitsChart.map((item) => ({
      month: item.label,
      completed: item.completed,
      canceled: item.canceled,
    })) ?? [];

  const revenueChartData =
    stats?.revenueChart.map((item) => ({
      month: item.label,
      revenue: item.revenue,
    })) ?? [];

  const genderChartData =
    stats?.genderChart.map((item) => ({
      month: item.label,
      male: item.male,
      female: item.female,
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header with employee name and period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-gilroy">Обзор эффективности</h2>
          <p className="text-sm text-muted-foreground">
            {stats
              ? formatPeriodLabel(stats.periodStart, stats.periodEnd)
              : "Загрузка..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OptionSwitcher
            value={period}
            onChange={handlePeriodChange}
            options={PERIOD_OPTIONS}
          />
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего визитов"
          value={formatNumber(stats?.visits.total ?? 0)}
          subtitle={`${stats?.visits.completed ?? 0} завершено`}
          icon={Users}
          trend={stats?.visitsTrend}
          iconColor="text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Среднее время приема"
          value={`${stats?.time.avgServiceTimeMinutes ?? 0} мин`}
          subtitle="На одного пациента"
          icon={Clock}
          iconColor="text-green-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Выручка"
          value={`${formatCurrencyCompact(stats?.financial.totalRevenue ?? 0)}`}
          subtitle={`~${formatCurrencyCompact(stats?.financial.avgRevenuePerVisit ?? 0)} за визит`}
          icon={DollarSign}
          trend={stats?.revenueTrend}
          iconColor="text-emerald-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Эффективность"
          value={`${stats?.efficiency.completionRate ?? 0}%`}
          subtitle="Завершенных визитов"
          icon={Target}
          trend={stats?.efficiencyTrend}
          iconColor="text-purple-600"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Activity className="mr-2 h-5 w-5 text-blue-600" />
              Динамика визитов
            </CardTitle>
            <CardDescription>
              Количество завершенных и отмененных визитов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <BarChartComponent
                data={visitsChartData}
                xKey="month"
                dataKeys={["completed", "canceled"]}
                labels={{ completed: "Завершено", canceled: "Отменено" }}
                height={250}
              />
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
              Динамика выручки
            </CardTitle>
            <CardDescription>Сумма выручки от оказанных услуг</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <BarChartComponent
                data={revenueChartData}
                xKey="month"
                dataKeys={["revenue"]}
                labels={{ revenue: "Выручка " }}
                height={250}
                yAxisFormatter={(v) => formatCurrencyCompact(v)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gender Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Users className="mr-2 h-5 w-5 text-purple-600" />
            Динамика пациентов по полу
          </CardTitle>
          <CardDescription>Распределение пациентов по полу</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <BarChartComponent
              data={genderChartData}
              xKey="month"
              dataKeys={["male", "female"]}
              labels={{ male: "Мужчины", female: "Женщины" }}
              height={250}
            />
          )}
        </CardContent>
      </Card>

      {/* Detailed Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visit Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Статусы визитов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Завершено</span>
                    </div>
                    <span className="font-medium text-sm">
                      {stats?.visits.completed ?? 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      stats?.visits.total
                        ? (stats.visits.completed / stats.visits.total) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">В процессе</span>
                    </div>
                    <span className="font-medium text-sm">
                      {stats?.visits.inProgress ?? 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      stats?.visits.total
                        ? (stats.visits.inProgress / stats.visits.total) * 100
                        : 0
                    }
                    className="h-2 [&>div]:bg-yellow-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Отменено</span>
                    </div>
                    <span className="font-medium text-sm">
                      {stats?.visits.canceled ?? 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      stats?.visits.total
                        ? (stats.visits.canceled / stats.visits.total) * 100
                        : 0
                    }
                    className="h-2 [&>div]:bg-red-500"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Work Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FileText className="mr-2 h-5 w-5 text-indigo-600" />
              Рабочая активность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Назначения</p>
                      <p className="text-xs text-muted-foreground">
                        Всего создано
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">
                    {formatNumber(stats?.activity.totalServiceOrders ?? 0)}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Pill className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Рецепты</p>
                      <p className="text-xs text-muted-foreground">Выписано</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">
                    {formatNumber(stats?.activity.totalPrescriptions ?? 0)}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Пациенты</p>
                      <p className="text-xs text-muted-foreground">
                        +{stats?.activity.newPatientsThisPeriod ?? 0} за период
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">
                    {stats?.activity.assignedPatients ?? 0}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Time Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Clock className="mr-2 h-5 w-5 text-orange-600" />
              Время приема
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.time.avgServiceTimeMinutes ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Мин. на прием</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {stats?.time.avgWaitingTimeMinutes ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Мин. ожидания</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
