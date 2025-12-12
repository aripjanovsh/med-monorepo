"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CardOverview } from "@/components/card-overview";
import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  XCircle,
} from "lucide-react";
import { useGetStatsQuery, StatsType } from "@/features/stats";
import { format } from "date-fns";

export const TodayStatsWidget = () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data, isLoading, error } = useGetStatsQuery({
    startDate: today,
    endDate: today,
  });

  const stats = data?.stats;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const statItems = [
    {
      title: "В очереди",
      value: stats[StatsType.PATIENTS_IN_QUEUE] ?? 0,
      description: "Ожидают приёма",
      icon: Clock,
    },
    {
      title: "Записей",
      value: stats[StatsType.APPOINTMENTS_COUNT] ?? 0,
      description: "На сегодня",
      icon: Calendar,
    },
    {
      title: "Завершено",
      value: stats[StatsType.COMPLETED_VISITS] ?? 0,
      description: "Визитов",
      icon: CheckCircle2,
    },
    {
      title: "Отменено",
      value: stats[StatsType.CANCELED_APPOINTMENTS] ?? 0,
      description: "Записей",
      icon: XCircle,
    },
    {
      title: "Не пришли",
      value: stats[StatsType.NO_SHOW_APPOINTMENTS] ?? 0,
      description: "No-show",
      icon: Users,
    },
    {
      title: "Выручка",
      value: `${((stats[StatsType.REVENUE_TOTAL] ?? 0) / 1000).toFixed(0)}K`,
      description: "сум",
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <CardOverview key={item.title} title={item.title} icon={item.icon}>
          <div className="text-2xl font-bold">{item.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {item.description}
          </p>
        </CardOverview>
      ))}
    </div>
  );
};
