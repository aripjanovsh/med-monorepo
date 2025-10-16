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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/cabinet/patients")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к пациентам
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Редактировать пациента
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Печать медицинской карты</DropdownMenuItem>
              <DropdownMenuItem>Экспорт данных</DropdownMenuItem>
              <DropdownMenuItem>Записать на прием</DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem className="text-red-600">
                Архивировать пациента
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">{fullName}</h1>
                  <p className="text-muted-foreground">
                    {age} лет • {patient.gender === "MALE" ? "Мужской" : "Женский"} • ID: {patient.patientId || patient.id}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  {primaryPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {primaryPhone}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Дата рождения: {new Date(patient.dateOfBirth).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <Badge variant={getStatusVariant(patient.status)}>
                {statusDisplay}
              </Badge>

              <div className="text-sm text-muted-foreground">
                {patient.doctors && patient.doctors.length > 0 && (
                  <div className="flex items-center justify-end">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    {patient.doctors[0].firstName} {patient.doctors[0].lastName}
                  </div>
                )}
                {patient.lastVisitedAt && (
                  <div className="flex items-center justify-end mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Последний визит: {new Date(patient.lastVisitedAt).toLocaleDateString("ru-RU")}
                  </div>
                )}
                <div className="flex items-center justify-end mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Регистрация: {new Date(patient.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Контакты</p>
                <p className="text-2xl font-bold">
                  {patient.contacts?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Назначенные врачи</p>
                <p className="text-2xl font-bold">
                  {patient.doctors?.filter(d => d.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Возраст</p>
                <p className="text-2xl font-bold">{age}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Статус</p>
                <p className="text-sm font-bold">{statusDisplay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="appointments">Приемы</TabsTrigger>
          <TabsTrigger value="history">Медицинская история</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PatientOverview patient={patient} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <PatientProfile patient={patient} />
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
