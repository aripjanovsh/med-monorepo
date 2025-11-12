import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartComponent, BarChartComponent, LineChartComponent } from './index';
import { PieChartComponent } from './pie-chart';

// Пример данных для графиков
const monthlyData = [
  { month: 'Янв', sales: 186, target: 150, visits: 250 },
  { month: 'Фев', sales: 305, target: 200, visits: 320 },
  { month: 'Мар', sales: 237, target: 220, visits: 280 },
  { month: 'Апр', sales: 300, target: 250, visits: 330 },
  { month: 'Май', sales: 209, target: 230, visits: 270 },
  { month: 'Июн', sales: 214, target: 240, visits: 260 },
];

// Добавляем данные для круговой диаграммы
const browserData = [
  { browser: 'Chrome', visitors: 60 },
  { browser: 'Firefox', visitors: 20 },
  { browser: 'Safari', visitors: 15 },
  { browser: 'Edge', visitors: 5 },
];

export function ChartExamples() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Простые примеры (минимальный набор параметров)</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Линейный график - Простой пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Линейный график</CardTitle>
            <CardDescription>Минимальная конфигурация</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Просто передаем данные - все настройки по умолчанию */}
            <LineChartComponent data={monthlyData} height={220} />
          </CardContent>
        </Card>

        {/* Столбчатая диаграмма - Простой пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Столбчатая диаграмма</CardTitle>
            <CardDescription>Минимальная конфигурация</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Просто передаем данные - все настройки по умолчанию */}
            <BarChartComponent data={monthlyData} height={220} />
          </CardContent>
        </Card>

        {/* График с областями - Простой пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">График с областями</CardTitle>
            <CardDescription>Минимальная конфигурация</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Просто передаем данные - все настройки по умолчанию */}
            <AreaChartComponent data={monthlyData} height={220} />
          </CardContent>
        </Card>

        {/* Круговая диаграмма - Простой пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Круговая диаграмма</CardTitle>
            <CardDescription>Минимальная конфигурация</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Просто передаем данные - все настройки по умолчанию */}
            <PieChartComponent
              data={browserData}
              dataKey="visitors"
              nameKey="browser"
              height={220}
            />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-10">Расширенные примеры (с настройками)</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Линейный график - Расширенный пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Линейный график</CardTitle>
            <CardDescription>Настроенные параметры</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={monthlyData}
              xKey="month"
              dataKeys={['sales', 'target']}
              labels={{ sales: 'Продажи', target: 'План' }}
              height={250}
              dotSize={5}
              strokeWidth={3}
              yAxisFormatter={(value) => `${value} шт.`}
              colors={['hsl(var(--success))', 'hsl(var(--warning))']}
            />
          </CardContent>
        </Card>

        {/* Столбчатая диаграмма - Расширенный пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Столбчатая диаграмма</CardTitle>
            <CardDescription>Настроенные параметры</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={monthlyData}
              xKey="month"
              dataKeys={['sales', 'visits']}
              labels={{ sales: 'Продажи', visits: 'Посещения' }}
              stacked={true}
              height={250}
              barSize={25}
              radius={[6, 6, 0, 0]}
              yAxisFormatter={(value) => `${value}`}
            />
          </CardContent>
        </Card>

        {/* График с областями - Расширенный пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">График с областями</CardTitle>
            <CardDescription>Настроенные параметры</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={monthlyData}
              xKey="month"
              dataKeys={['revenue', 'target']}
              labels={{ revenue: 'Выручка', target: 'План' }}
              stacked={true}
              height={250}
              showLegend={true}
              showYAxis={true}
              fillOpacity={0.6}
            />
          </CardContent>
        </Card>

        {/* Специфический пример - Линейный график без точек */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Линейный график</CardTitle>
            <CardDescription>Без точек на линии</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={monthlyData}
              xKey="month"
              dataKeys={['revenue']}
              height={250}
              hideDots={true}
              strokeWidth={4}
              yAxisFormatter={(value) => `${(value / 1000).toFixed(0)}K₽`}
              colors={['hsl(var(--primary))']}
            />
          </CardContent>
        </Card>

        {/* Специфический пример - Столбчатая диаграмма с выбранными данными */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Выборочные данные</CardTitle>
            <CardDescription>Только целевые показатели</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={monthlyData}
              xKey="month"
              dataKeys={['target']}
              height={250}
              barSize={40}
              colors={['hsl(var(--primary))']}
            />
          </CardContent>
        </Card>

        {/* Специфический пример - График с областью и заданной непрозрачностью */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Настройка прозрачности</CardTitle>
            <CardDescription>Высокая непрозрачность заливки</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={monthlyData.slice(0, 3)}
              xKey="month"
              dataKeys={['visits']}
              height={250}
              fillOpacity={0.9}
              colors={['hsl(var(--destructive))']}
            />
          </CardContent>
        </Card>

        {/* Кольцевая диаграмма - Расширенный пример */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Кольцевая диаграмма</CardTitle>
            <CardDescription>Настроенные параметры</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={browserData}
              dataKey="visitors"
              nameKey="browser"
              labels={{
                Chrome: 'Google Chrome',
                Firefox: 'Mozilla Firefox',
                Safari: 'Apple Safari',
                Edge: 'Microsoft Edge',
              }}
              height={250}
              innerRadius={60}
              outerRadius={90}
              showLabels={true}
              labelType="nameAndPercent"
              centerContent={
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Всего</div>
                  <div className="text-xl font-semibold">100</div>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Пример с PieChart, использующий пользовательскую функцию для меток */}
        <Card className="p-6 bg-white shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle>Круговая диаграмма с пользовательскими метками</CardTitle>
            <CardDescription>
              Пример использования PieChartComponent с label функцией
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={[
                { name: 'Chrome', value: 60 },
                { name: 'Firefox', value: 20 },
                { name: 'Safari', value: 15 },
                { name: 'Edge', value: 5 },
              ]}
              height={300}
              showLegend={true}
              legendPosition="bottom"
              showLabels={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            />
          </CardContent>
        </Card>

        <Card className="p-6 bg-white shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle>Кольцевая диаграмма с пользовательскими метками</CardTitle>
            <CardDescription>
              Пример использования PieChartComponent как кольцевой диаграммы с label функцией
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={[
                { name: 'Chrome', value: 60 },
                { name: 'Firefox', value: 20 },
                { name: 'Safari', value: 15 },
                { name: 'Edge', value: 5 },
              ]}
              height={300}
              showLegend={true}
              legendPosition="bottom"
              showLabels={true}
              innerRadius={60}
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              centerContent={<div className="text-lg font-medium">Браузеры</div>}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
