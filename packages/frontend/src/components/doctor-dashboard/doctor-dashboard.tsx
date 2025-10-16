"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientQueue } from "./patient-queue";
import { DoctorCalendar } from "./doctor-calendar";
import { DashboardStats } from "./dashboard-stats";
import { RecentActivity } from "./recent-activity";
import { TodaySchedule } from "./today-schedule";
import { QuickActions } from "./quick-actions";

export function DoctorDashboard() {
  return (
    <div className="flex-1 space-y-4 ">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Панель врача</h2>
      </div>

      {/* Top Stats */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Patient Queue - Takes 3 columns */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Очередь пациентов</CardTitle>
            <CardDescription>
              Текущие пациенты в очереди на прием
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <PatientQueue />
          </CardContent>
        </Card>

        {/* Today's Schedule - Takes 3 columns */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Расписание на сегодня</CardTitle>
            <CardDescription>Ваши назначенные приемы</CardDescription>
          </CardHeader>
          <CardContent>
            <TodaySchedule />
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Calendar - Takes 4 columns */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Календарь</CardTitle>
            <CardDescription>Управление расписанием и записями</CardDescription>
          </CardHeader>
          <CardContent>
            <DoctorCalendar />
          </CardContent>
        </Card>

        {/* Quick Actions and Recent Activity */}
        <div className="col-span-3 space-y-4">
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
              <CardTitle>Недавняя активность</CardTitle>
              <CardDescription>Последние действия в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
