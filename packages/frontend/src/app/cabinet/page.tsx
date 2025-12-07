"use client";

import { CardDescription } from "@/components/ui/card";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardOverview } from "@/components/card-overview";
import { BarChartComponent, PieChartComponent } from "@/components/charts";
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  Activity,
  Stethoscope,
  Building2,
} from "lucide-react";

// Mock данные для статистики
const stats = {
  totalPatients: 1247,
  activePatients: 892,
  totalEmployees: 48,
  visitsToday: 67,
  visitsMonth: 1834,
  avgWaitTime: 12,
  satisfaction: 94,
  activeDepartments: 12,
  avgServiceTime: 22,
};

const visitsChartData = [
  { date: "Пн", visits: 45, completed: 42 },
  { date: "Вт", visits: 52, completed: 48 },
  { date: "Ср", visits: 61, completed: 58 },
  { date: "Чт", visits: 48, completed: 45 },
  { date: "Пт", visits: 55, completed: 52 },
  { date: "Сб", visits: 38, completed: 35 },
  { date: "Вс", visits: 22, completed: 20 },
];

// Mock данные по отделениям
const departmentsData = [
  { name: "Терапия", patients: 320, color: "#3b82f6" },
  { name: "Хирургия", patients: 180, color: "#10b981" },
  { name: "Педиатрия", patients: 240, color: "#f59e0b" },
  { name: "Кардиология", patients: 150, color: "#ef4444" },
  { name: "Неврология", patients: 120, color: "#8b5cf6" },
];

const topDoctors = [
  { name: "Петрова А.М.", visits: 156, specialty: "Терапия" },
  { name: "Козлов В.И.", visits: 142, specialty: "Кардиология" },
  { name: "Новикова Е.С.", visits: 128, specialty: "Хирургия" },
  { name: "Смирнов К.Д.", visits: 115, specialty: "Педиатрия" },
  { name: "Ибрагимов Р.Т.", visits: 109, specialty: "Неврология" },
  { name: "Юсупова М.И.", visits: 105, specialty: "Гинекология" },
  { name: "Громов А.Р.", visits: 97, specialty: "Хирургия" },
  { name: "Литвиненко Д.С.", visits: 90, specialty: "Терапия" },
  { name: "Ахмедова З.Ш.", visits: 88, specialty: "Аллергология" },
  { name: "Рахматуллаев Б.О.", visits: 82, specialty: "Кардиология" },
];

const topServices = [
  { name: "Прием терапевта", count: 320 },
  { name: "Кардиология — первичный", count: 280 },
  { name: "УЗИ брюшной полости", count: 245 },
  { name: "Анализ крови общий", count: 230 },
  { name: "Прием педиатра", count: 215 },
  { name: "МРТ головного мозга", count: 188 },
  { name: "Хирургический осмотр", count: 176 },
  { name: "Анализ крови биохимия", count: 170 },
  { name: "Невролог — консультация", count: 162 },
  { name: "Рентген грудной клетки", count: 150 },
];

// Mock данные последних визитов
const recentVisits = [
  {
    id: "1",
    patient: "Иванов Иван",
    doctor: "Петрова А.М.",
    department: "Терапия",
    time: "10:30",
    status: "completed",
  },
  {
    id: "2",
    patient: "Сидорова Мария",
    doctor: "Козлов В.И.",
    department: "Кардиология",
    time: "11:00",
    status: "in_progress",
  },
  {
    id: "3",
    patient: "Петров Сергей",
    doctor: "Новикова Е.С.",
    department: "Хирургия",
    time: "11:30",
    status: "waiting",
  },
  {
    id: "4",
    patient: "Козлова Анна",
    doctor: "Смирнов К.Д.",
    department: "Педиатрия",
    time: "12:00",
    status: "waiting",
  },
  {
    id: "5",
    patient: "Новиков Дмитрий",
    doctor: "Петрова А.М.",
    department: "Неврология",
    time: "12:30",
    status: "waiting",
  },
];

const visitsChartLabels = {
  visits: "Записи",
  completed: "Завершено",
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Завершён
        </Badge>
      );
    case "in_progress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          В процессе
        </Badge>
      );
    case "waiting":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Ожидает
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Page() {
  const statCards = [
    {
      title: "Всего пациентов",
      value: stats.totalPatients.toLocaleString(),
      description: `${stats.activePatients} активных`,
      icon: Users,
    },
    {
      title: "Сотрудников",
      value: stats.totalEmployees,
      description: "Врачей и персонала",
      icon: UserCheck,
    },
    {
      title: "Визитов сегодня",
      value: stats.visitsToday,
      description: `${stats.visitsMonth} за месяц`,
      icon: CalendarCheck,
    },
    {
      title: "Активных отделений",
      value: stats.activeDepartments,
      description: "В работе",
      icon: Building2,
    },
    {
      title: "Ср. время ожидания",
      value: `${stats.avgWaitTime} мин`,
      description: "В очереди",
      icon: Clock,
    },
    {
      title: "Ср. время приёма",
      value: `${stats.avgServiceTime} мин`,
      description: "Длительность визита",
      icon: Clock,
    },
  ];

  return (
    <>
      <LayoutHeader title="Дашборд" />
      <CabinetContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((stat) => (
              <CardOverview
                key={stat.title}
                title={stat.title}
                icon={stat.icon}
                className="h-full"
              >
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardOverview>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CardOverview title="Визиты за неделю" icon={CalendarCheck}>
              <BarChartComponent
                data={visitsChartData}
                xKey="date"
                dataKeys={["visits", "completed"]}
                labels={visitsChartLabels}
                height={300}
                showYAxis
                showLegend
              />
            </CardOverview>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <CardOverview title="Отделения" icon={Building2}>
              <PieChartComponent
                data={departmentsData}
                dataKey="patients"
                nameKey="name"
                height={260}
                showLegend
                legendPosition="bottom"
                showLabels
                labelType="nameAndPercent"
                innerRadius={50}
                outerRadius={90}
                colors={departmentsData.map((dept) => dept.color)}
              />
            </CardOverview>

            <CardOverview title="Топ 10 докторов" icon={Stethoscope}>
              <div className="space-y-3">
                {topDoctors.map((doctor) => (
                  <div
                    key={doctor.name}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">
                      {doctor.visits} визитов
                    </span>
                  </div>
                ))}
              </div>
            </CardOverview>

            <CardOverview title="Топ 10 услуг" icon={Activity}>
              <div className="space-y-3">
                {topServices.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{service.name}</p>
                    </div>
                    <span className="text-sm font-semibold">
                      {service.count} раз
                    </span>
                  </div>
                ))}
              </div>
            </CardOverview>
          </div>

          <CardOverview title="Последние визиты" icon={CalendarCheck}>
            <CardDescription className="mb-4">
              Сегодняшние записи
            </CardDescription>
            <div className="space-y-4">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-xs">
                        {visit.patient
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{visit.patient}</p>
                      <p className="text-xs text-muted-foreground">
                        {visit.department} • {visit.time}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(visit.status)}
                </div>
              ))}
            </div>
          </CardOverview>
        </div>
      </CabinetContent>
    </>
  );
}
