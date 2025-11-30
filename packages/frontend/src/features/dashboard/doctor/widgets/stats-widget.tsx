"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Hourglass,
} from "lucide-react";

type DoctorStatsDto = {
  totalPatients: number;
  patientsInQueue: number;
  completedToday: number;
  canceledToday: number;
  avgWaitingTime?: number;
  avgServiceTime?: number;
};

type StatsWidgetProps = {
  stats: DoctorStatsDto;
};

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
};

export const StatsWidget = ({ stats }: StatsWidgetProps) => {
  const statCards = [
    {
      title: "Всего пациентов",
      value: stats.totalPatients,
      description: "За сегодня",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "В очереди",
      value: stats.patientsInQueue,
      description: "Ожидают приёма",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Завершено",
      value: stats.completedToday,
      description: "Визитов завершено",
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Отменено",
      value: stats.canceledToday,
      description: "Записей отменено",
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Ср. ожидание",
      value: formatMinutes(stats.avgWaitingTime ?? 0),
      description: "Время ожидания",
      icon: Hourglass,
      color: "text-amber-600",
      isTime: true,
    },
    {
      title: "Ср. приём",
      value: formatMinutes(stats.avgServiceTime ?? 0),
      description: "Время приёма",
      icon: Timer,
      color: "text-purple-600",
      isTime: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
