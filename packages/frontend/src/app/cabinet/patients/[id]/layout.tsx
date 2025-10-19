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

import {
  useGetPatientQuery,
  getPatientFullName,
  calculatePatientAge,
  getPatientDisplayStatus,
  getPatientPrimaryPhone,
} from "@/features/patients";

import { LayoutHeader } from "@/components/layouts/cabinet";
import { DetailNavigation } from "@/components/detail-navigation";

export default function PatientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: patient, isLoading } = useGetPatientQuery(
    { id: id as string },
    { skip: !id }
  );

  const navItems = [
    { label: "Обзор", href: `/cabinet/patients/${id}`, value: "overview" },
    {
      label: "Профиль",
      href: `/cabinet/patients/${id}/profile`,
      value: "profile",
    },
    {
      label: "Врачи",
      href: `/cabinet/patients/${id}/doctors`,
      value: "doctors",
    },
    { label: "Визиты", href: `/cabinet/patients/${id}/visits`, value: "visits" },
    {
      label: "Записи",
      href: `/cabinet/patients/${id}/appointments`,
      value: "appointments",
    },
    {
      label: "История",
      href: `/cabinet/patients/${id}/history`,
      value: "history",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузка данных пациента...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Пациент не найден
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Пациент, которого вы ищете, не существует или был удален.
          </p>
        </div>
      </div>
    );
  }

  const fullName = getPatientFullName(patient);
  const age = calculatePatientAge(patient.dateOfBirth);
  const statusDisplay = getPatientDisplayStatus(patient.status);

  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/patients" backTitle="Пациенты" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="size-10">
            <AvatarImage alt={fullName} />
            <AvatarFallback className="text-lg">
              {fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h2 className="text-xl font-gilroy font-bold leading-none">
              {fullName}
            </h2>
            <p className="text-xs text-muted-foreground leading-none">
              {age} лет • {patient.gender === "MALE" ? "Мужской" : "Женский"} •{" "}
              {statusDisplay} • {patient.patientId}
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
              <DropdownMenuItem>Печать карточки пациента</DropdownMenuItem>
              <DropdownMenuItem>Экспорт данных</DropdownMenuItem>
              <DropdownMenuItem>Запланировать встречу</DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem className="text-red-600">
                Деактивировать пациента
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation */}
      <DetailNavigation items={navItems} baseHref={`/cabinet/patients/${id}`} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
