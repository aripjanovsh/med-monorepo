import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

// Типы данных для метки
export interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  value: number;
  index: number;
}

// Типы для функции рендеринга метки
export type LabelRenderer = (props: PieLabelProps) => React.ReactNode;

export interface PieChartProps {
  /** Данные для графика */
  data: Record<string, any>[];
  /** Ключ для значения (например, 'value', 'count', 'visitors') */
  dataKey?: string;
  /** Ключ для имени сегмента (например, 'category', 'name', 'browser') */
  nameKey?: string;
  /** Отображаемые метки для сегментов (например, { chrome: 'Google Chrome' }) */
  labels?: Record<string, string>;
  /** Высота графика */
  height?: number | string;
  /** Отображать ли легенду */
  showLegend?: boolean;
  /** Расположение легенды */
  legendPosition?: "top" | "bottom" | "left" | "right";
  /** Внутренний радиус (для кольцевой диаграммы, 0 - для обычной) */
  innerRadius?: number | string;
  /** Внешний радиус */
  outerRadius?: number | string;
  /** Показывать ли метки на диаграмме */
  showLabels?: boolean;
  /** Тип метки на диаграмме */
  labelType?: "percent" | "value" | "name" | "nameAndPercent";
  /** Показывать линии к меткам */
  labelLine?: boolean;
  /** Дополнительные классы */
  className?: string;
  /** Цвета для сегментов (если не указаны, используются цвета по умолчанию) */
  colors?: string[];
  /** Смещение начала диаграммы (в градусах) */
  startAngle?: number;
  /** Смещение конца диаграммы (в градусах) */
  endAngle?: number;
  /** Содержимое в центре (для кольцевых диаграмм) */
  centerContent?: React.ReactNode;
  /** Пользовательская функция для рендеринга меток */
  label?: LabelRenderer;
}

/**
 * Компонент для отображения круговой/кольцевой диаграммы
 *
 * @example
 * // Простое использование
 * <PieChartComponent
 *   data={[
 *     { name: 'Chrome', value: 60 },
 *     { name: 'Firefox', value: 20 },
 *     { name: 'Safari', value: 15 },
 *     { name: 'Edge', value: 5 }
 *   ]}
 * />
 *
 * @example
 * // Настроенное использование
 * <PieChartComponent
 *   data={browsersData}
 *   dataKey="visitors"
 *   nameKey="browser"
 *   labels={{ chrome: 'Google Chrome', firefox: 'Mozilla Firefox' }}
 *   height={300}
 *   innerRadius={60}
 *   outerRadius={100}
 *   showLegend={true}
 *   legendPosition="bottom"
 *   showLabels={true}
 *   labelType="nameAndPercent"
 *   centerContent={<div>Всего:<br />1250</div>}
 * />
 *
 * @example
 * // Использование с пользовательской функцией для меток
 * <PieChartComponent
 *   data={data}
 *   showLabels={true}
 *   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 * />
 */
export function PieChartComponent({
  data,
  dataKey = "value",
  nameKey = "name",
  labels,
  height = 300,
  showLegend = false,
  legendPosition = "bottom",
  innerRadius = 0,
  outerRadius = "80%",
  showLabels = true,
  labelType = "percent",
  labelLine = false,
  className = "",
  colors,
  startAngle = 0,
  endAngle = 360,
  centerContent,
  label,
}: PieChartProps) {
  // Получаем все уникальные имена сегментов из данных
  const names = data.map((item) => item[nameKey]);

  // Строим конфигурацию для графика
  const config: ChartConfig = names.reduce((cfg, name, index) => {
    const defaultColors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "hsl(var(--chart-6))",
    ];
    return {
      ...cfg,
      [name]: {
        label: labels?.[name] || name,
        color: colors?.[index] || defaultColors[index % defaultColors.length],
      },
    };
  }, {});

  // Функция для получения цвета сегмента
  const getColor = (entry: any, index: number) => {
    const name = entry[nameKey];
    return config[name]?.color || `hsl(var(--chart-${(index % 6) + 1}))`;
  };

  // Функция для генерации метки на диаграмме
  const renderCustomizedLabel = (props: PieLabelProps) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius: innerR,
      outerRadius: outerR,
      percent,
      name,
      value,
    } = props;

    // Если передана пользовательская функция для отображения меток, используем её
    if (label) {
      const RADIAN = Math.PI / 180;
      const radius = Number(innerR) + (Number(outerR) - Number(innerR)) * 1.1;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      const labelContent = label(props);

      return (
        <text
          x={x}
          y={y}
          fill={config[name]?.color}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
        >
          {labelContent}
        </text>
      );
    }

    // Стандартный рендеринг метки
    const RADIAN = Math.PI / 180;
    const radius = Number(innerR) + (Number(outerR) - Number(innerR)) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    let labelContent = "";
    switch (labelType) {
      case "percent":
        labelContent = `${(percent * 100).toFixed(0)}%`;
        break;
      case "value":
        labelContent = `${value}`;
        break;
      case "name":
        labelContent = labels?.[name] || name;
        break;
      case "nameAndPercent":
        labelContent = `${labels?.[name] || name}: ${(percent * 100).toFixed(0)}%`;
        break;
    }

    return (
      <text
        x={x}
        y={y}
        fill={config[name]?.color}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {labelContent}
      </text>
    );
  };

  return (
    <div
      className={`${className} relative`}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: "100%",
      }}
    >
      <ChartContainer
        config={{
          ...config,
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />

            {showLegend && (
              <Legend
                layout={
                  legendPosition === "left" || legendPosition === "right"
                    ? "vertical"
                    : "horizontal"
                }
                verticalAlign={legendPosition === "top" ? "top" : "bottom"}
                align={legendPosition === "right" ? "right" : "center"}
              />
            )}

            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={labelLine}
              label={showLabels ? renderCustomizedLabel : undefined}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={startAngle}
              endAngle={endAngle}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Центральный контент для кольцевых диаграмм */}
      {centerContent && Number(innerRadius) > 0 && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ pointerEvents: "none" }}
        >
          {centerContent}
        </div>
      )}
    </div>
  );
}
