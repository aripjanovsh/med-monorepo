import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { CardOverview } from "@/components/card-overview";
import { useGetInvoiceQuickStatsQuery } from "@/features/stats";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  invoicesCount: {
    label: "Счета",
    color: "var(--chart-1)",
  },
  revenue: {
    label: "Выручка",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

export const InvoicesQuickStats = () => {
  const { data: stats, isLoading } = useGetInvoiceQuickStatsQuery();

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
    invoicesCount: trend.invoicesCount,
    revenue: trend.revenue,
  }));

  const growthColor =
    stats.growthPercent >= 0 ? "text-green-500" : "text-red-500";
  const growthPrefix = stats.growthPercent >= 0 ? "+" : "";

  return (
    <div className="grid grid-cols-5 border-t border-b bg-background -mx-6">
      <div className="flex justify-between border-r col-span-2 items-center">
        <CardOverview
          title="Общая выручка"
          className="bg-background border-transparent shadow-none rounded-none"
        >
          <div className="flex justify-between gap-4">
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
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
                <linearGradient id="fillInvoices" x1="0" y1="0" x2="0" y2="1">
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

                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="invoicesCount"
                type="natural"
                fill="url(#fillInvoices)"
                strokeWidth={2}
                fillOpacity={0.4}
                stroke="var(--chart-1)"
                stackId="a"
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
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
            <span className="text-muted-foreground">Неоплаченные:</span>
            <span className="font-semibold">
              {formatNumber(stats.statusDistribution.unpaid)} (
              {stats.statusDistribution.unpaidPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Частично:</span>
            <span className="font-semibold">
              {formatNumber(stats.statusDistribution.partiallyPaid)} (
              {stats.statusDistribution.partiallyPaidPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Оплаченные:</span>
            <span className="font-semibold">
              {formatNumber(stats.statusDistribution.paid)} (
              {stats.statusDistribution.paidPercent}%)
            </span>
          </div>
        </div>
      </CardOverview>

      <CardOverview
        title="Методы оплаты"
        className="bg-background border-transparent shadow-none rounded-none border-r-border"
      >
        <div className="flex flex-col gap-0.5">
          {stats.paymentMethodDistribution.length > 0 ? (
            stats.paymentMethodDistribution.map((method) => (
              <div
                key={method.method}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{method.method}:</span>
                <span className="font-medium">
                  {formatNumber(method.count)} ({method.percent}%)
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              Нет данных о платежах
            </span>
          )}
        </div>
      </CardOverview>

      <CardOverview
        title="К оплате"
        className="bg-background border-transparent shadow-none rounded-none"
      >
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(stats.totalOutstanding)}
          </div>
          <p className="text-xs text-muted-foreground">
            Собрано:{" "}
            <span className="text-green-500">
              {formatCurrency(stats.totalCollected)}
            </span>
          </p>
        </div>
      </CardOverview>
    </div>
  );
};
