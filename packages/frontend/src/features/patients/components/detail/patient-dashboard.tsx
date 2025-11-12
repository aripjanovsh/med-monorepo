"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChartComponent } from "@/components/charts/line-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { 
  Calendar, 
  ClipboardList,
  TrendingUp,
  Clock,
  ArrowRight,
  Stethoscope,
  Heart,
  Users,
  Target,
  Zap,
  Shield
} from "lucide-react";

import type { PatientResponseDto } from "../../patient.dto";
import {
  calculatePatientAge,
} from "../../patient.model";
import { formatDate } from "@/lib/date.utils";

interface PatientDashboardProps {
  patient: PatientResponseDto;
}

// Метки для графиков
const visitsLabels = {
  visits: "Визиты",
};

const healthMetricsLabels = {
  bloodPressure: "Давление",
  heartRate: "Пульс",
  temperature: "Температура",
};

const ordersStatusLabels = {
  ordered: "Назначено",
  inProgress: "В процессе",
  completed: "Завершено",
  cancelled: "Отменено",
};

const departmentLabels = {
  cardiology: "Кардиология",
  neurology: "Неврология",
  therapy: "Терапия",
  diagnostics: "Диагностика",
};

// Статичные данные для прототипа
const mockVisitsData = [
  { month: "Янв", visits: 2 },
  { month: "Фев", visits: 3 },
  { month: "Мар", visits: 1 },
  { month: "Апр", visits: 4 },
  { month: "Май", visits: 2 },
  { month: "Июн", visits: 5 },
];

const mockHealthMetrics = [
  { date: "01.06", bloodPressure: 120, heartRate: 72, temperature: 36.6 },
  { date: "08.06", bloodPressure: 118, heartRate: 68, temperature: 36.5 },
  { date: "15.06", bloodPressure: 125, heartRate: 75, temperature: 36.7 },
  { date: "22.06", bloodPressure: 122, heartRate: 70, temperature: 36.6 },
  { date: "29.06", bloodPressure: 119, heartRate: 69, temperature: 36.5 },
];

const mockOrdersStatus = [
  { status: "ordered", count: 8 },
  { status: "inProgress", count: 3 },
  { status: "completed", count: 12 },
  { status: "cancelled", count: 1 },
];

const mockDepartmentVisits = [
  { department: "cardiology", visits: 5 },
  { department: "neurology", visits: 3 },
  { department: "therapy", visits: 7 },
  { department: "diagnostics", visits: 4 },
];

const mockRecentVisits = [
  { id: "1", date: "2024-06-28", doctor: "Др. Иванов А.С.", department: "Кардиология", status: "completed" },
  { id: "2", date: "2024-06-15", doctor: "Др. Петров М.И.", department: "Терапия", status: "completed" },
  { id: "3", date: "2024-06-01", doctor: "Др. Сидорова Е.Н.", department: "Неврология", status: "completed" },
  { id: "4", date: "2024-05-20", doctor: "Др. Козлов Д.В.", department: "Диагностика", status: "completed" },
  { id: "5", date: "2024-05-10", doctor: "Др. Новикова Т.А.", department: "Кардиология", status: "completed" },
];

const mockActiveOrders = [
  { id: "1", name: "ЭКГ", department: "Кардиология", status: "ordered", date: "2024-06-30" },
  { id: "2", name: "Анализ крови", department: "Лаборатория", status: "inProgress", date: "2024-06-29" },
  { id: "3", name: "УЗИ сердца", department: "Диагностика", status: "ordered", date: "2024-06-28" },
];

const mockDoctors = [
  { id: "1", name: "Др. Иванов А.С.", specialty: "Кардиолог", status: "active" },
  { id: "2", name: "Др. Петров М.И.", specialty: "Терапевт", status: "active" },
  { id: "3", name: "Др. Сидорова Е.Н.", specialty: "Невролог", status: "inactive" },
];

export function PatientDashboard({ patient }: PatientDashboardProps) {
  const age = calculatePatientAge(patient.dateOfBirth);
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "DECEASED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Завершен</Badge>;
      case "inProgress":
        return <Badge variant="secondary">В процессе</Badge>;
      case "ordered":
        return <Badge variant="outline">Назначен</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Отменен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header с основной информацией */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-400">
                <span className="font-medium">{age} лет</span>
                <span>•</span>
                <span>{patient.gender === 'MALE' ? 'Мужской' : 'Женский'}</span>
                <span>•</span>
                <Badge variant={getStatusVariant(patient.status)}>
                  {patient.status === 'ACTIVE' ? 'Активен' : patient.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">ID пациента</div>
              <div className="font-mono font-medium">{patient.patientId}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего визитов</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">17</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2 за последний месяц</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активные назначения</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Требуют внимания</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <ClipboardList className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Лечащие врачи</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">1 активный</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Stethoscope className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Последний визит</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">28 июня</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 дня назад</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Динамика визитов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Динамика визитов
            </CardTitle>
            <CardDescription>Количество визитов за последние 6 месяцев</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={mockVisitsData}
              xKey="month"
              dataKeys={["visits"]}
              labels={visitsLabels}
              height={300}
              showGrid={true}
              showYAxis={true}
              hideDots={false}
              dotSize={6}
              activeDotSize={8}
              strokeWidth={3}
            />
          </CardContent>
        </Card>

        {/* Статус назначений */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Статус назначений
            </CardTitle>
            <CardDescription>Распределение по статусам выполнения</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={mockOrdersStatus}
              dataKey="count"
              nameKey="status"
              labels={ordersStatusLabels}
              height={300}
              innerRadius={60}
              outerRadius={100}
              showLegend={true}
              showLabels={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Дополнительные графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Показатели здоровья */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Показатели здоровья
            </CardTitle>
            <CardDescription>Динамика за последний месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={mockHealthMetrics}
              xKey="date"
              dataKeys={["bloodPressure", "heartRate", "temperature"]}
              labels={healthMetricsLabels}
              height={300}
              showGrid={true}
              showYAxis={true}
              showLegend={true}
              fillOpacity={0.6}
            />
          </CardContent>
        </Card>

        {/* Посещения по отделениям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Посещения по отделениям
            </CardTitle>
            <CardDescription>Распределение визитов по специализациям</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={mockDepartmentVisits}
              xKey="department"
              dataKeys={["visits"]}
              labels={departmentLabels}
              height={300}
              showGrid={true}
              showYAxis={true}
              radius={[8, 8, 0, 0]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Таблицы с данными */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последние визиты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Последние визиты
            </CardTitle>
            <CardDescription>История посещений</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <div className="font-medium">{visit.doctor}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{visit.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatDate(visit.date)}</div>
                    {getStatusBadge(visit.status)}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Показать все визиты
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Активные назначения */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Активные назначения
            </CardTitle>
            <CardDescription>Требуют выполнения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActiveOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <div>
                      <div className="font-medium">{order.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatDate(order.date)}</div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Все назначения
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Лечащие врачи */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Лечащие врачи
          </CardTitle>
          <CardDescription>Медицинские специалисты</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockDoctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</div>
                </div>
                <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                  {doctor.status === 'active' ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
