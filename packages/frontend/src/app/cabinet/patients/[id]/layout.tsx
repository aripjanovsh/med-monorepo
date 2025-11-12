"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal, Clock, MapPin, User, ArrowRight, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      label: "Назначения",
      href: `/cabinet/patients/${id}/service-orders`,
      value: "service-orders",
    },
    {
      label: "Счета",
      href: `/cabinet/patients/${id}/invoices`,
      value: "invoices",
    },
    {
      label: "Файлы",
      href: `/cabinet/patients/${id}/files`,
      value: "files",
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

  // Mock данные активного визита - в реальном приложении загружать через API
  const activeVisit = {
    id: "visit-123",
    status: "IN_PROGRESS",
    startTime: "2024-06-30T10:30:00",
    doctor: {
      firstName: "Иван",
      lastName: "Петров",
      specialty: "Кардиолог"
    },
    department: "Кардиология",
    room: "205"
  };

  // Функция для форматирования времени визита
  const getVisitDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} мин`;
    }
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}ч ${minutes}м`;
  };

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

      {/* Активный визит */}
      {activeVisit && (
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Статус индикатор */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    <Activity className="h-3 w-3 mr-1" />
                    Активный визит
                  </Badge>
                </div>

                {/* Информация о визите */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(activeVisit.startTime).toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      ({getVisitDuration(activeVisit.startTime)})
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {activeVisit.doctor.firstName} {activeVisit.doctor.lastName}
                    </span>
                    <span className="text-muted-foreground">
                      • {activeVisit.doctor.specialty}
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{activeVisit.department}</span>
                    <span className="text-muted-foreground">
                      • Кабинет {activeVisit.room}
                    </span>
                  </div>
                </div>
              </div>

              {/* Кнопка перехода */}
              <Button 
                size="sm" 
                onClick={() => router.push(`/cabinet/patients/${id}/visits/${activeVisit.id}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                Открыть визит
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <DetailNavigation items={navItems} baseHref={`/cabinet/patients/${id}`} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
