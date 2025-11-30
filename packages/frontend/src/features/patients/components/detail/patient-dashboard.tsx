"use client";

import type { ReactElement } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
} from "@/components/charts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Clock,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { useGetPatientDashboardStatsQuery } from "../../patient.api";
import { formatDate, formatRelativeDate } from "@/lib/date.utils";

// ======================
// Types
// ======================

type PatientDashboardProps = {
  patientId: string;
};

// ======================
// Constants
// ======================

const VISITS_LABELS = {
  visits: "Визиты",
};

const ORDERS_STATUS_LABELS: Record<string, string> = {
  ordered: "Назначено",
  inProgress: "В процессе",
  completed: "Завершено",
  cancelled: "Отменено",
};

const VISITS_LABELS_BY_DEPT = {
  visits: "Визиты",
};

// ======================
// Helper Components
// ======================

const MetricCardSkeleton = (): ReactElement => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const ChartSkeleton = (): ReactElement => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-60" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
);

// ======================
// Helper Functions
// ======================

const getStatusBadge = (status: string): ReactElement => {
  switch (status) {
    case "completed":
      return <Badge variant="default">Завершен</Badge>;
    case "inProgress":
      return <Badge variant="secondary">В процессе</Badge>;
    case "ordered":
      return <Badge variant="outline">Назначен</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Отменен</Badge>;
    case "waiting":
      return <Badge variant="outline">Ожидание</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStatusDotColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "inProgress":
      return "bg-blue-500";
    case "ordered":
      return "bg-orange-500";
    case "cancelled":
      return "bg-red-500";
    case "waiting":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getDoctorInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
};

// ======================
// Main Component
// ======================

export const PatientDashboard = ({
  patientId,
}: PatientDashboardProps): ReactElement => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useGetPatientDashboardStatsQuery(patientId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Не удалось загрузить статистику пациента
        </p>
      </div>
    );
  }

  const {
    metrics,
    visitsByMonth,
    ordersByStatus,
    visitsByDepartment,
    recentVisits,
    activeOrders,
    treatingDoctors,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Всего визитов
                </p>
                <p className="text-2xl font-bold">{metrics.totalVisits}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{metrics.visitsLastMonth} за последний месяц
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Активные назначения
                </p>
                <p className="text-2xl font-bold">{metrics.activeOrders}</p>
                {metrics.activeOrders > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Требуют внимания
                  </p>
                )}
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <ClipboardList className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Лечащие врачи
                </p>
                <p className="text-2xl font-bold">{metrics.totalDoctors}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {metrics.activeDoctors} активных
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Stethoscope className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Последний визит
                </p>
                {metrics.lastVisitDate ? (
                  <>
                    <p className="text-lg font-bold">
                      {formatDate(metrics.lastVisitDate, "d MMMM")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeDate(metrics.lastVisitDate)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">—</p>
                )}
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Динамика визитов
            </CardTitle>
            <CardDescription>
              Количество визитов за последние 6 месяцев
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visitsByMonth.length > 0 ? (
              <LineChartComponent
                data={visitsByMonth}
                xKey="month"
                dataKeys={["visits"]}
                labels={VISITS_LABELS}
                height={300}
                showGrid
                showYAxis
                hideDots={false}
                dotSize={6}
                activeDotSize={8}
                strokeWidth={3}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Нет данных о визитах
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Статус назначений
            </CardTitle>
            <CardDescription>
              Распределение по статусам выполнения
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length > 0 ? (
              <PieChartComponent
                data={ordersByStatus}
                dataKey="count"
                nameKey="status"
                labels={ORDERS_STATUS_LABELS}
                height={300}
                innerRadius={60}
                outerRadius={100}
                showLegend
                showLabels={false}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Нет данных о назначениях
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Visits */}
      {visitsByDepartment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Посещения по отделениям
            </CardTitle>
            <CardDescription>
              Распределение визитов по специализациям
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={visitsByDepartment}
              xKey="department"
              dataKeys={["visits"]}
              labels={VISITS_LABELS_BY_DEPT}
              height={300}
              showGrid
              showYAxis
              radius={[8, 8, 0, 0]}
            />
          </CardContent>
        </Card>
      )}

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Последние визиты
            </CardTitle>
            <CardDescription>История посещений</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVisits.length > 0 ? (
                recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusDotColor(visit.status)}`}
                      />
                      <div>
                        <div className="font-medium">{visit.doctor}</div>
                        <div className="text-sm text-muted-foreground">
                          {visit.department}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatDate(visit.date)}
                      </div>
                      {getStatusBadge(visit.status)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Нет визитов
                </p>
              )}
              {recentVisits.length > 0 && (
                <Button variant="outline" className="w-full">
                  Показать все визиты
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Активные назначения
            </CardTitle>
            <CardDescription>Требуют выполнения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusDotColor(order.status)}`}
                      />
                      <div>
                        <div className="font-medium">{order.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.department}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatDate(order.date)}
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Нет активных назначений
                </p>
              )}
              {activeOrders.length > 0 && (
                <Button variant="outline" className="w-full">
                  Все назначения
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treating Doctors */}
      {treatingDoctors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Лечащие врачи
            </CardTitle>
            <CardDescription>Медицинские специалисты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {treatingDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                    {getDoctorInitials(doctor.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{doctor.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {doctor.specialty}
                    </div>
                  </div>
                  <Badge
                    variant={
                      doctor.status === "active" ? "default" : "secondary"
                    }
                  >
                    {doctor.status === "active" ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
