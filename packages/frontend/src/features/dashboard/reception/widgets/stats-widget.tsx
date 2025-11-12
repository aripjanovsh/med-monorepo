"use client";

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
} from "lucide-react";
import { useGetDashboardStatsQuery } from "@/features/reception";

type StatsWidgetProps = {
  date?: string;
};

export const StatsWidget = ({ date }: StatsWidgetProps) => {
  const {
    data: stats,
    isLoading,
    error,
  } = useGetDashboardStatsQuery(date ? { date } : undefined);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[140px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-destructive/50 p-4 text-center">
        <p className="text-sm text-destructive">Ошибка загрузки статистики</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Всего пациентов",
      value: stats.totalPatientsToday,
      description: "За сегодня",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Записей",
      value: stats.totalAppointmentsToday,
      description: "Всего записей",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "В очереди",
      value: stats.patientsInQueue,
      description: "Ожидают приема",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Завершено",
      value: stats.completedVisits,
      description: "Визитов завершено",
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Отменено",
      value: stats.canceledAppointments,
      description: "Записей отменено",
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Не пришли",
      value: stats.noShowAppointments,
      description: "No-show",
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      title: "Выручка",
      value: `${stats.totalRevenueToday.toLocaleString()} сум`,
      description: "За сегодня",
      icon: DollarSign,
      color: "text-green-600",
      isLarge: true,
    },
    {
      title: "Неоплачено",
      value: stats.unpaidInvoicesCount,
      description: "Счетов без оплаты",
      icon: FileText,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div
              className={`${stat.isLarge ? "text-xl" : "text-2xl"} font-bold`}
            >
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
