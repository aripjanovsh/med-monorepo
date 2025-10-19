"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useGetEmployeeQuery } from "@/features/employees";

import { LayoutHeader } from "@/components/layouts/cabinet";
import { DetailNavigation } from "@/components/detail-navigation";

export default function EmployeeDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: employee, isLoading } = useGetEmployeeQuery(id as string, {
    skip: !id,
  });

  const navItems = [
    { label: "Обзор", href: `/cabinet/employees/${id}`, value: "overview" },
    {
      label: "Профиль",
      href: `/cabinet/employees/${id}/profile`,
      value: "profile",
    },
    {
      label: "Расписание",
      href: `/cabinet/employees/${id}/schedule`,
      value: "schedule",
    },
    {
      label: "Эффективность",
      href: `/cabinet/employees/${id}/performance`,
      value: "performance",
    },
    {
      label: "Образование",
      href: `/cabinet/employees/${id}/education`,
      value: "education",
    },
    {
      label: "Приемы",
      href: `/cabinet/employees/${id}/appointments`,
      value: "appointments",
    },
    {
      label: "Пациенты",
      href: `/cabinet/employees/${id}/patients`,
      value: "patients",
    },
    {
      label: "Визиты",
      href: `/cabinet/employees/${id}/visits`,
      value: "visits",
    },
    {
      label: "Заметки",
      href: `/cabinet/employees/${id}/notes`,
      value: "notes",
    },
  ];

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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Сотрудник не найден
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Сотрудник, которого вы ищете, не существует или был удален.
          </p>
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

      {/* Navigation */}
      <DetailNavigation items={navItems} baseHref={`/cabinet/employees/${id}`} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
