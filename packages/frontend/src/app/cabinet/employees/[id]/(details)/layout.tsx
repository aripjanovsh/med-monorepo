"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useGetEmployeeQuery,
  getEmployeeFullName,
  getEmployeeTitle,
} from "@/features/employees";
import { LoadingState, ErrorState } from "@/components/states";
import { LayoutHeader, CabinetContent } from "@/components/layouts/cabinet";
import { DetailNavigation } from "@/components/detail-navigation";
import { ROUTES, url } from "@/constants/route.constants";

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
    {
      label: "Обзор",
      href: url(ROUTES.EMPLOYEE_DETAIL, { id }),
      value: "overview",
    },
    {
      label: "Профиль",
      href: `${url(ROUTES.EMPLOYEE_DETAIL, { id })}/profile`,
      value: "profile",
    },
    {
      label: "Пациенты",
      href: `${url(ROUTES.EMPLOYEE_DETAIL, { id })}/patients`,
      value: "patients",
    },
    {
      label: "Записи",
      href: `${url(ROUTES.EMPLOYEE_DETAIL, { id })}/appointments`,
      value: "appointments",
    },
    {
      label: "Визиты",
      href: `${url(ROUTES.EMPLOYEE_DETAIL, { id })}/visits`,
      value: "visits",
    },
    {
      label: "Файлы",
      href: `${url(ROUTES.EMPLOYEE_DETAIL, { id })}/files`,
      value: "files",
    },
    {
      label: "Заметки",
      href: `${url(ROUTES.EMPLOYEE_DETAIL, { id })}/notes`,
      value: "notes",
    },
  ];

  const handleEdit = useCallback(() => {
    router.push(url(ROUTES.EMPLOYEE_EDIT, { id }));
  }, [router, id]);

  if (isLoading) {
    return <LoadingState title="Загрузка данных сотрудника..." />;
  }

  if (!employee) {
    return (
      <ErrorState
        title="Сотрудник не найден"
        description="Сотрудник, которого вы ищете, не существует или был удален."
        onBack={() => router.push(ROUTES.EMPLOYEES)}
        backLabel="Вернуться к списку сотрудников"
      />
    );
  }

  return (
    <>
      <LayoutHeader
        backHref={ROUTES.EMPLOYEES}
        backTitle="Сотрудники"
        left={
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarId={employee.avatarId}
              name={getEmployeeFullName(employee)}
              className="size-10"
              size={40}
              fallbackClassName="text-lg"
            />
            <div className="flex flex-col">
              <h2 className="text-lg font-gilroy font-bold leading-tight">
                {getEmployeeFullName(employee)}
              </h2>
              <p className="text-xs text-muted-foreground leading-tight">
                {getEmployeeTitle(employee)}
              </p>
            </div>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
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
        }
      />
      <CabinetContent>
        <DetailNavigation
          items={navItems}
          baseHref={url(ROUTES.EMPLOYEE_DETAIL, { id })}
        />
        <div className="mt-6">{children}</div>
      </CabinetContent>
    </>
  );
}
