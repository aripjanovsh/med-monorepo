import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { CardOverview } from "@/components/card-overview";
import { useGetVisitQuickStatsQuery } from "@/features/stats";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  visitsCount: {
    label: "Визиты",
    color: "var(--chart-1)",
  },
  completedCount: {
    label: "Завершено",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours} ч ${remainingMinutes} мин`
    : `${hours} ч`;
};

export const VisitsQuickStats = () => {
  const { data: stats, isLoading } = useGetVisitQuickStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 py-4 my-4 border-t border-b bg-card">
        <div className="flex justify-between border-r col-span-2 items-center px-4">
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="px-4">
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="px-4">
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="px-4">
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const chartData = stats.monthlyTrends.map((trend) => ({
    month: trend.monthShort,
    visitsCount: trend.visitsCount,
    completedCount: trend.completedCount,
  }));

  const growthColor =
    stats.growthPercent >= 0 ? "text-green-500" : "text-red-500";
  const growthPrefix = stats.growthPercent >= 0 ? "+" : "";

  return (
    <div className="grid grid-cols-5 border-t border-b bg-background -mx-6">
      <div className="flex justify-between border-r col-span-2 items-center">
        <CardOverview
          title="Всего визитов"
          className="bg-background border-transparent shadow-none rounded-none"
        >
          <div className="flex justify-between gap-4">
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalVisits)}
              </div>
              <p className="text-xs text-muted-foreground text-nowrap">
                <span className={growthColor}>
                  {growthPrefix}
                  {stats.growthPercent}%
                </span>{" "}
                к прошлому месяцу
              </p>
            </div>
          </div>
        </CardOverview>

        <div className="w-full pr-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[120px]"
          >
            <AreaChart accessibilityLayer data={chartData}>
              <CartesianGrid horizontal={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <defs>
                <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="visitsCount"
                type="natural"
                fill="url(#fillVisits)"
                strokeWidth={2}
                fillOpacity={0.4}
                stroke="var(--chart-1)"
                stackId="a"
              />
              <Area
                dataKey="completedCount"
                type="natural"
                fill="url(#fillCompleted)"
                strokeWidth={2}
                fillOpacity={0.4}
                stroke="var(--chart-2)"
                stackId="b"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      <CardOverview
        title="По статусу"
        className="bg-background border-transparent shadow-none rounded-none border-r-border"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Ожидают:</span>
            <span className="font-semibold">
              {formatNumber(stats.statusDistribution.waiting)} (
              {stats.statusDistribution.waitingPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">В процессе:</span>
            <span className="font-semibold">
              {formatNumber(stats.statusDistribution.inProgress)} (
              {stats.statusDistribution.inProgressPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Завершены:</span>
            <span className="font-semibold text-green-600">
              {formatNumber(stats.statusDistribution.completed)} (
              {stats.statusDistribution.completedPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Отменены:</span>
            <span className="font-semibold text-red-500">
              {formatNumber(stats.statusDistribution.canceled)} (
              {stats.statusDistribution.canceledPercent}%)
            </span>
          </div>
        </div>
      </CardOverview>

      <CardOverview
        title="Среднее время"
        className="bg-background border-transparent shadow-none rounded-none border-r-border"
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Ожидание</span>
            <span className="text-sm font-semibold">
              {formatMinutes(stats.avgWaitingTimeMinutes)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Прием</span>
            <span className="text-sm font-semibold">
              {formatMinutes(stats.avgServiceTimeMinutes)}
            </span>
          </div>
        </div>
      </CardOverview>

      <CardOverview
        title="Эффективность"
        className="bg-background border-transparent shadow-none rounded-none"
      >
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-green-600">
            {stats.completionRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            Завершено{" "}
            <span className="font-medium">
              {formatNumber(stats.completedVisits)}
            </span>{" "}
            из{" "}
            <span className="font-medium">
              {formatNumber(stats.totalVisits)}
            </span>
          </p>
        </div>
      </CardOverview>
    </div>
  );
};
