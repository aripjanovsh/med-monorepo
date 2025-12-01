import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { CardOverview } from "@/components/card-overview";
import { useGetEmployeeQuickStatsQuery } from "@/features/stats/stats.api";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  newEmployees: {
    label: "Новые сотрудники",
    color: "var(--chart-1)",
  },
  terminatedEmployees: {
    label: "Уволенные",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const EmployeesQuickStats = () => {
  const { data: stats, isLoading } = useGetEmployeeQuickStatsQuery();

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
    newEmployees: trend.newEmployees,
    terminatedEmployees: trend.terminatedEmployees,
  }));

  const growthColor =
    stats.growthPercent >= 0 ? "text-green-500" : "text-red-500";

  const growthPrefix = stats.growthPercent >= 0 ? "+" : "";

  return (
    <div className="grid grid-cols-5 border-t border-b bg-background -mx-6">
      <div className="flex justify-between border-r col-span-2 items-center">
        <CardOverview
          title="Всего сотрудников"
          className="bg-background border-transparent shadow-none rounded-none"
        >
          <div className="flex justify-between gap-4">
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {stats.total.toLocaleString("ru-RU")}
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
                <linearGradient id="fillEmployees" x1="0" y1="0" x2="0" y2="1">
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

                <linearGradient id="fillTerminated" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="newEmployees"
                type="natural"
                fill="url(#fillEmployees)"
                fillOpacity={0.4}
                stroke="var(--chart-1)"
                stackId="a"
              />
              <Area
                dataKey="terminatedEmployees"
                type="natural"
                fill="url(#fillTerminated)"
                fillOpacity={0.4}
                stroke="var(--chart-3)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      <CardOverview
        title="По статусу"
        className="bg-background border-transparent shadow-none rounded-none border-r-border"
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Активных:</span>
            <span className="font-semibold text-green-600">
              {stats.statusDistribution.active.toLocaleString("ru-RU")}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">В отпуске:</span>
            <span className="font-semibold text-yellow-600">
              {stats.statusDistribution.onLeave.toLocaleString("ru-RU")}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Неактивных:</span>
            <span className="font-semibold text-gray-500">
              {stats.statusDistribution.inactive.toLocaleString("ru-RU")}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Уволенных:</span>
            <span className="font-semibold text-red-600">
              {stats.statusDistribution.terminated.toLocaleString("ru-RU")}
            </span>
          </div>
        </div>
      </CardOverview>

      <CardOverview
        title="По отделениям"
        className="bg-background border-transparent shadow-none rounded-none border-r-border"
      >
        <div className="flex flex-col gap-0.5 max-h-[80px] overflow-y-auto">
          {stats.byDepartment.slice(0, 5).map((dept) => (
            <div
              key={dept.departmentId}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground truncate max-w-[100px]">
                {dept.departmentName}:
              </span>
              <span className="font-medium">
                {dept.count.toLocaleString("ru-RU")}
              </span>
            </div>
          ))}
        </div>
      </CardOverview>

      <CardOverview
        title="Активные"
        className="bg-background border-transparent shadow-none rounded-none"
      >
        <div className="flex flex-col">
          <div className="text-2xl font-bold">
            {stats.activeCount.toLocaleString("ru-RU")}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-500">
              {stats.total > 0
                ? Math.round((stats.activeCount / stats.total) * 100)
                : 0}
              %
            </span>{" "}
            от всех сотрудников
          </p>
        </div>
      </CardOverview>
    </div>
  );
};
