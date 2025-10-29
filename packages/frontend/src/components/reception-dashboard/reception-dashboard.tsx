"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReceptionStats } from "./reception-stats";
import { CurrentVisits } from "./current-visits";
import { DoctorScheduleOverview } from "./doctor-schedule-overview";
import { QuickPatientSearch } from "./quick-patient-search";
import { TodayAppointments } from "./today-appointments";
import { QuickActions } from "./quick-actions";
import { WaitingQueue } from "./waiting-queue";

export function ReceptionDashboard() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Панель регистратуры</h2>
      </div>

      {/* Top Stats */}
      <ReceptionStats />

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Current Visits - Takes 4 columns */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Текущие визиты</CardTitle>
            <CardDescription>
              Пациенты, которые пришли на прием сегодня
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentVisits />
          </CardContent>
        </Card>

        {/* Waiting Queue - Takes 3 columns */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Очередь ожидания</CardTitle>
            <CardDescription>Пациенты в зале ожидания</CardDescription>
          </CardHeader>
          <CardContent>
            <WaitingQueue />
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Doctor Schedule - Takes 4 columns */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Расписание врачей</CardTitle>
            <CardDescription>Доступность врачей на сегодня</CardDescription>
          </CardHeader>
          <CardContent>
            <DoctorScheduleOverview />
          </CardContent>
        </Card>

        {/* Quick Actions and Patient Search */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Быстрый поиск</CardTitle>
              <CardDescription>Поиск пациента по ФИО или ID</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickPatientSearch />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Предстоящие приемы</CardTitle>
              <CardDescription>Следующие записи на сегодня</CardDescription>
            </CardHeader>
            <CardContent>
              <TodayAppointments />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
