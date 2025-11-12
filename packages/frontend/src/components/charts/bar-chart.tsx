import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export interface BarChartProps {
  /** Данные для графика */
  data: Record<string, any>[];
  /** Ключ для оси X */
  xKey?: string;
  /** Ключи для значений (будут отображены на графике) */
  dataKeys?: string[];
  /** Отображаемые метки для ключей (например, { sales: 'Продажи', target: 'План' }) */
  labels?: Record<string, string>;
  /** Высота графика */
  height?: number | string;
  /** Отображать ли сетку */
  showGrid?: boolean;
  /** Отображать ли легенду */
  showLegend?: boolean;
  /** Показывать ли ось Y */
  showYAxis?: boolean;
  /** Формат чисел на оси Y */
  yAxisFormatter?: (value: number) => string;
  /** Использовать ли стекинг (накопление) */
  stacked?: boolean;
  /** Радиус скругления столбцов */
  radius?: number | [number, number, number, number];
  /** Дополнительные классы */
  className?: string;
  /** Цвета для столбцов (если не указаны, используются цвета по умолчанию) */
  colors?: string[];
}

/**
 * Компонент для отображения столбчатой диаграммы
 *
 * @example
 * // Простое использование
 * <BarChartComponent
 *   data={[
 *     { month: 'Янв', sales: 100, target: 80 },
 *     { month: 'Фев', sales: 150, target: 100 }
 *   ]}
 * />
 *
 * @example
 * // Настроенное использование
 * <BarChartComponent
 *   data={salesData}
 *   xKey="month"
 *   dataKeys={['sales', 'target']}
 *   labels={{ sales: 'Продажи', target: 'План' }}
 *   height={300}
 *   showLegend={true}
 *   stacked={true}
 *   barSize={25}
 *   radius={[4, 4, 0, 0]}
 *   yAxisFormatter={(value) => `${value}₽`}
 * />
 */
export function BarChartComponent({
  data,
  xKey = 'month',
  dataKeys,
  labels,
  height = 300,
  showGrid = true,
  showLegend = false,
  showYAxis = false,
  yAxisFormatter,
  stacked = false,
  radius = 8,
  className = '',
  colors,
}: BarChartProps) {
  // Если dataKeys не указаны, берем все ключи кроме xKey из первого объекта данных
  const keys =
    dataKeys || (data && data.length > 0 ? Object.keys(data[0]).filter((key) => key !== xKey) : []);

  // Строим конфигурацию для графика
  const config: ChartConfig = keys.reduce((cfg, key, index) => {
    const defaultColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
    ];
    return {
      ...cfg,
      [key]: {
        label: labels?.[key] || key.charAt(0).toUpperCase() + key.slice(1), // Используем метку из labels или делаем первую букву заглавной
        color: colors?.[index] || defaultColors[index % defaultColors.length],
      },
    };
  }, {});

  return (
    <div
      className={`${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',
      }}
    >
      <ChartContainer config={config} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            {showGrid && <CartesianGrid vertical={false} />}

            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />

            {showYAxis && (
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisFormatter || ((value) => value.toLocaleString())}
              />
            )}

            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

            {showLegend && <Legend />}

            {keys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={config[key]?.color}
                stackId={stacked ? 'stack' : undefined}
                radius={radius}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
