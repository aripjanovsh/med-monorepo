"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Phone,
  Calendar,
  Activity,
  FileText,
  Stethoscope,
  AlertTriangle,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  PatientResponseDto,
  useGetPatientQuery,
  getPatientFullName,
  calculatePatientAge,
  getPatientDisplayStatus,
  getPatientPrimaryPhone,
} from "@/features/patients";

// Import components
import { PatientOverview } from "@/features/patients/components/detail/patient-overview";
import { PatientProfile } from "@/features/patients/components/detail/patient-profile";
import { PatientAppointments } from "@/features/patients/components/detail/patient-appointments";
import { PatientMedicalHistory } from "@/features/patients/components/detail/patient-medical-history";
import { PatientVisits } from "@/features/patients/components/detail/patient-visits";
import { LayoutHeader } from "@/components/layouts/cabinet";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: patient, isLoading } = useGetPatientQuery(
    { id: id as string },
    { skip: !id }
  );
  const [activeTab, setActiveTab] = useState("overview");

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
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Пациент не найден
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Пациент, которого вы ищете, не существует или был удален.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push("/cabinet/patients")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к пациентам
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fullName = getPatientFullName(patient);
  const age = calculatePatientAge(patient.dateOfBirth);
  const statusDisplay = getPatientDisplayStatus(patient.status);
  const primaryPhone = getPatientPrimaryPhone(patient);
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default" as const;
      case "INACTIVE":
        return "secondary" as const;
      case "DECEASED":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
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
          <TabsTrigger variant="underline" value="visits">
            Визиты
          </TabsTrigger>
          <TabsTrigger variant="underline" value="appointments">
            Записи
          </TabsTrigger>
          <TabsTrigger variant="underline" value="history">
            История
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PatientOverview patient={patient} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <PatientProfile patient={patient} />
        </TabsContent>

        <TabsContent value="visits" className="space-y-6">
          <PatientVisits patientId={patient.id} />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <PatientAppointments patientId={patient.id} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <PatientMedicalHistory patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
