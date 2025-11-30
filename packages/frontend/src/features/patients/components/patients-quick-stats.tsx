import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { CardOverview } from "@/components/card-overview";
import { useGetPatientQuickStatsQuery } from "@/features/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, RefreshCw } from "lucide-react";

const chartConfig = {
  newPatients: {
    label: "Новые пациенты",
    color: "var(--chart-1)",
  },
  visits: {
    label: "Посещения",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const PatientsQuickStats = () => {
  const { data: stats, isLoading } = useGetPatientQuickStatsQuery();

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
    newPatients: trend.newPatients,
    visits: trend.visits,
  }));

  console.log(chartData);

  const growthColor =
    stats.growthPercent >= 0 ? "text-green-500" : "text-red-500";

  const growthPrefix = stats.growthPercent >= 0 ? "+" : "";

  return (
    <div className="grid grid-cols-5 border-t border-b bg-card -mx-6">
      <div className="flex justify-between border-r col-span-2 items-center">
        <CardOverview
          title="Всего пациентов"
          className="border-transparent shadow-none rounded-none"
        >
          <div className="flex justify-between gap-4">
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {stats.totalPatients.toLocaleString("ru-RU")}
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
                <linearGradient id="fillPatients" x1="0" y1="0" x2="0" y2="1">
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

                <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="newPatients"
                type="natural"
                fill="url(#fillPatients)"
                fillOpacity={0.4}
                stroke="var(--chart-1)"
                stackId="a"
              />
              <Area
                dataKey="visits"
                type="natural"
                fill="url(#fillVisits)"
                fillOpacity={0.4}
                stroke="var(--chart-2)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      <CardOverview
        title="По полу"
        className="border-transparent shadow-none rounded-none border-r-border"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Мужчин:</span>
            <span className="font-semibold">
              {stats.genderDistribution.male.toLocaleString("ru-RU")} (
              {stats.genderDistribution.malePercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Женщин:</span>
            <span className="font-semibold">
              {stats.genderDistribution.female.toLocaleString("ru-RU")} (
              {stats.genderDistribution.femalePercent}%)
            </span>
          </div>
        </div>
      </CardOverview>

      <CardOverview
        title="По возрасту"
        className="border-transparent shadow-none rounded-none border-r-border"
      >
        <div className="flex flex-col gap-0.5">
          {stats.ageDistribution.map((age) => (
            <div
              key={age.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground">{age.label}:</span>
              <span className="font-medium">
                {age.count.toLocaleString("ru-RU")} ({age.percent}%)
              </span>
            </div>
          ))}
        </div>
      </CardOverview>

      <CardOverview
        title="Повторные визиты"
        className="border-transparent shadow-none rounded-none"
      >
        <div className="flex flex-col">
          <div className="text-2xl font-bold">
            {stats.returningPatients.toLocaleString("ru-RU")}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-500">
              {stats.returningPatientsPercent}%
            </span>{" "}
            от всех пациентов
          </p>
        </div>
      </CardOverview>
    </div>
  );
};
