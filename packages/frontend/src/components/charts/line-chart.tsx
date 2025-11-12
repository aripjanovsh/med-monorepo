import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

export interface LineChartProps {
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
  /** Размер точек на линии */
  dotSize?: number;
  /** Размер активной точки (при наведении) */
  activeDotSize?: number;
  /** Толщина линии */
  strokeWidth?: number;
  /** Дополнительные классы */
  className?: string;
  /** Цвета для линий (если не указаны, используются цвета по умолчанию) */
  colors?: string[];
  /** Скрыть точки на линии */
  hideDots?: boolean;
}

/**
 * Компонент для отображения линейного графика
 *
 * @example
 * // Простое использование
 * <LineChartComponent
 *   data={[
 *     { month: 'Янв', sales: 100, target: 80 },
 *     { month: 'Фев', sales: 150, target: 100 }
 *   ]}
 * />
 *
 * @example
 * // Настроенное использование
 * <LineChartComponent
 *   data={salesData}
 *   xKey="month"
 *   dataKeys={['sales', 'target']}
 *   labels={{ sales: 'Продажи', target: 'План' }}
 *   height={300}
 *   showLegend={true}
 *   dotSize={5}
 *   strokeWidth={3}
 *   yAxisFormatter={(value) => `${value}₽`}
 * />
 */
export function LineChartComponent({
  data,
  xKey = 'month',
  dataKeys,
  labels,
  height = 300,
  showGrid = true,
  showLegend = false,
  showYAxis = false,
  yAxisFormatter,
  dotSize = 4,
  activeDotSize,
  strokeWidth = 2,
  className = '',
  colors,
  hideDots = true,
}: LineChartProps) {
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

  // Настройки для точек на линии
  const dotProps = hideDots ? false : { r: dotSize, strokeWidth: 0 };
  const activeDotProps = hideDots ? false : { r: activeDotSize || dotSize + 2, strokeWidth: 0 };

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
          <LineChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}

            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />

            {showYAxis && (
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={yAxisFormatter || ((value) => value.toLocaleString())}
              />
            )}

            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

            {showLegend && <Legend />}

            {keys.map((key) => (
              <Line
                key={key}
                type="natural"
                dataKey={key}
                stroke={config[key]?.color}
                fill={config[key]?.color}
                strokeWidth={strokeWidth}
                dot={dotProps}
                activeDot={activeDotProps}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
