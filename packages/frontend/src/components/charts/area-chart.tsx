import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

export interface AreaChartProps {
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
  /** Формат чисел на дополнительной оси Y (правой) */
  secondYAxisFormatter?: (value: number) => string;
  /** Использовать ли стекинг (накопление) */
  stacked?: boolean;
  /** Дополнительные классы */
  className?: string;
  /** Непрозрачность заливки */
  fillOpacity?: number;
  /** Цвета для линий (если не указаны, используются цвета по умолчанию) */
  colors?: string[];
  /** Использовать вторую ось Y для последнего ключа данных */
  useSecondYAxis?: boolean;
  /** Ключ для отображения на второй оси Y */
  secondYAxisKey?: string;
}

/**
 * Компонент для отображения графика с областями
 *
 * @example
 * // Простое использование
 * <AreaChartComponent
 *   data={[
 *     { month: 'Янв', sales: 100, target: 80 },
 *     { month: 'Фев', sales: 150, target: 100 }
 *   ]}
 * />
 *
 * @example
 * // Настроенное использование
 * <AreaChartComponent
 *   data={salesData}
 *   xKey="month"
 *   dataKeys={['sales', 'target']}
 *   labels={{ sales: 'Продажи', target: 'План' }}
 *   height={300}
 *   showLegend={true}
 *   stacked={true}
 *   yAxisFormatter={(value) => `${value}₽`}
 * />
 *
 * @example
 * // Использование с двумя осями Y
 * <AreaChartComponent
 *   data={purchaseData}
 *   dataKeys={['сумма', 'количество']}
 *   useSecondYAxis={true}
 *   secondYAxisKey="количество"
 *   showYAxis={true}
 *   showLegend={true}
 * />
 */
export function AreaChartComponent({
  data,
  xKey = 'month',
  dataKeys,
  labels,
  height = 300,
  showGrid = true,
  showLegend = false,
  showYAxis = false,
  yAxisFormatter,
  secondYAxisFormatter,
  stacked = false,
  className = '',
  fillOpacity = 0.4,
  colors,
  useSecondYAxis = false,
  secondYAxisKey,
}: AreaChartProps) {
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

  // Определяем, какой ключ использовать для второй оси Y
  const secondAxis =
    useSecondYAxis && secondYAxisKey
      ? secondYAxisKey
      : useSecondYAxis && keys.length > 1
        ? keys[keys.length - 1]
        : undefined;

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
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: showYAxis && secondAxis ? 45 : 12,
              top: 12,
              bottom: 12,
            }}
          >
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}

            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />

            {showYAxis && (
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisFormatter || ((value) => value.toLocaleString())}
                yAxisId="left"
              />
            )}

            {showYAxis && secondAxis && (
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                orientation="right"
                yAxisId="right"
                tickFormatter={secondYAxisFormatter || ((value) => value.toString())}
              />
            )}

            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

            {showLegend && <Legend />}

            {keys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={config[key]?.color}
                fill={config[key]?.color}
                fillOpacity={fillOpacity}
                stackId={stacked ? 'stack' : undefined}
                yAxisId={key === secondAxis ? 'right' : 'left'}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
