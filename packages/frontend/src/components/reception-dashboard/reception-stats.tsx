"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, CheckCircle2 } from "lucide-react";

export function ReceptionStats() {
  // Mock data - will be replaced with real data later
  const stats = [
    {
      title: "Всего пациентов сегодня",
      value: "24",
      icon: Users,
      description: "+3 с начала дня",
      trend: "up",
    },
    {
      title: "Записей на сегодня",
      value: "32",
      icon: Calendar,
      description: "8 еще не пришли",
      trend: "neutral",
    },
    {
      title: "В очереди",
      value: "5",
      icon: Clock,
      description: "Среднее ожидание: 15 мин",
      trend: "neutral",
    },
    {
      title: "Завершено приемов",
      value: "19",
      icon: CheckCircle2,
      description: "59% от запланированных",
      trend: "up",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
