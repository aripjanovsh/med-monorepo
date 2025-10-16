"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar, Activity } from "lucide-react";

export function DashboardStats() {
  const stats = [
    {
      title: "Пациенты сегодня",
      value: "12",
      description: "+2 с вчера",
      icon: Users,
    },
    {
      title: "В очереди",
      value: "3",
      description: "Ожидают приема",
      icon: Clock,
    },
    {
      title: "Назначений",
      value: "8",
      description: "На эту неделю",
      icon: Calendar,
    },
    {
      title: "Завершено",
      value: "9",
      description: "Сегодня",
      icon: Activity,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
