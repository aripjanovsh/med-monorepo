"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";

type DoctorStatsDto = {
  totalPatients: number;
  patientsInQueue: number;
  completedToday: number;
  canceledToday: number;
};

type StatsWidgetProps = {
  stats: DoctorStatsDto;
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
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
