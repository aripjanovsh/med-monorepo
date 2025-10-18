"use client";

import { useState, use } from "react";
import { ArrowLeft, Edit, MoreHorizontal, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useGetEmployeeQuery } from "@/features/employees";

// Import components
import { EmployeeOverview } from "@/features/employees/components/detail/employee-overview";
import { EmployeeProfile } from "@/features/employees/components/detail/employee-profile";
import { EmployeeSchedule } from "@/features/employees/components/detail/employee-schedule";
import { EmployeePerformance } from "@/features/employees/components/detail/employee-performance";
import { EmployeeEducation } from "@/features/employees/components/detail/employee-education";
import { EmployeeAppointments } from "@/features/employees/components/detail/employee-appointments";
import { EmployeeNotes } from "@/features/employees/components/detail/employee-notes";
import { EmployeePatients } from "@/features/employees/components/detail/employee-patients";
import { useRouter } from "next/navigation";
import { LayoutHeader } from "@/components/layouts/cabinet";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  // console.log("params", params);
  const { data: employee, isLoading } = useGetEmployeeQuery(id as string, {
    skip: !id,
  });
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузка данных сотрудника...
          </p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Сотрудник не найден
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Сотрудник, которого вы ищете, не существует или был удален.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push("/cabinet/employees")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к сотрудникам
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/employees" backTitle="Сотрудники" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="size-10">
            <AvatarImage alt={employee.firstName} />
            <AvatarFallback className="text-lg">
              {employee.firstName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h2 className="text-xl font-gilroy font-bold leading-none">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-xs text-muted-foreground leading-none">
              {employee.title?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Печать карточки сотрудника</DropdownMenuItem>
              <DropdownMenuItem>Экспорт данных</DropdownMenuItem>
              <DropdownMenuItem>Запланировать встречу</DropdownMenuItem>
              <DropdownMenuItem>Оценка эффективности</DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem className="text-red-600">
                Деактивировать сотрудника
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          variant="underline"
          className="-mx-6 mb-6"
          contentClassName="px-4"
        >
          <TabsTrigger variant="underline" value="overview">
            Обзор
          </TabsTrigger>
          <TabsTrigger variant="underline" value="profile">
            Профиль
          </TabsTrigger>
          <TabsTrigger variant="underline" value="schedule">
            Расписание
          </TabsTrigger>
          <TabsTrigger variant="underline" value="performance">
            Эффективность
          </TabsTrigger>
          <TabsTrigger variant="underline" value="education">
            Образование
          </TabsTrigger>
          <TabsTrigger variant="underline" value="appointments">
            Приемы
          </TabsTrigger>
          <TabsTrigger variant="underline" value="patients">
            Пациенты
          </TabsTrigger>
          <TabsTrigger variant="underline" value="notes">
            Заметки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EmployeeOverview employee={employee} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <EmployeeProfile employee={employee} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <EmployeeSchedule employee={employee} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <EmployeePerformance employee={employee} />
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <EmployeeEducation employee={employee} />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <EmployeeAppointments employee={employee} />
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <EmployeePatients employee={employee} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <EmployeeNotes employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
