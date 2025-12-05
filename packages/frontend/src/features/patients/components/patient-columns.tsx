"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PatientResponseDto } from "../patient.dto";
import {
  getPatientFullName,
  getPatientDisplayStatus,
  getPatientInitials,
  getPatientPrimaryPhone,
  formatPatientInfo,
  getPatientLastVisit,
} from "../patient.model";
import Link from "next/link";
import { ROUTES, url } from "@/constants/route.constants";
import { Calendar, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/date.utils";
import { UserAvatar } from "@/components/ui/user-avatar";

export const patientColumns: ColumnDef<PatientResponseDto>[] = [
  {
    accessorKey: "firstName",
    header: "Пациент",
    enableSorting: true,
    cell: ({ row }) => {
      const patient = row.original;
      const fullName = getPatientFullName(patient);
      const initials = getPatientInitials(patient);

      return (
        <>
          <div className="font-medium">{fullName}</div>
          <div className="text-sm text-muted-foreground">
            {patient.patientId || "Без ID"}
          </div>
        </>
      );
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "Информация",
    cell: ({ row }) => {
      const patient = row.original;
      const info = formatPatientInfo(patient);
      const phone = getPatientPrimaryPhone(patient);

      return (
        <div>
          <div className="font-medium">{info}</div>
          {phone && (
            <div className="text-sm text-muted-foreground">{phone}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "lastVisitedAt",
    header: "Последний визит",
    enableSorting: true,
    cell: ({ row }) => {
      const patient = row.original;
      const lastVisit = getPatientLastVisit(patient);

      return <div className="text-sm">{lastVisit}</div>;
    },
  },
  {
    accessorKey: "doctors",
    header: "Врачи",
    cell: ({ row }) => {
      const patient = row.original;
      const activeDoctors = patient.doctors?.filter((d) => d.isActive) || [];
      const sortedDoctors = [...activeDoctors].sort((a, b) => {
        const dateA = new Date(a.assignedAt).getTime();
        const dateB = new Date(b.assignedAt).getTime();
        return dateB - dateA;
      });

      if (sortedDoctors.length === 0) {
        return (
          <div className="text-sm text-muted-foreground">Не назначены</div>
        );
      }

      // Если несколько врачей - показываем аватарки с тултипами
      return (
        <div className="flex -space-x-2">
          {sortedDoctors.slice(0, 3).map((doctor) => {
            const doctorName = `${doctor.firstName} ${doctor.lastName}`.trim();
            const doctorTitle = doctor.title?.name;
            const tooltipContent = doctorTitle
              ? `${doctorName}, ${doctorTitle}`
              : doctorName;

            return (
              <Tooltip key={doctor.id}>
                <TooltipTrigger asChild>
                  <UserAvatar
                    name={doctorName}
                    avatarId={doctor.avatarId}
                    className="h-8 w-8 border-2 border-card cursor-pointer"
                    fallbackClassName="bg-blue-100 text-blue-700 text-xs font-medium"
                    size={32}
                  />
                </TooltipTrigger>
                <TooltipContent>{tooltipContent}</TooltipContent>
              </Tooltip>
            );
          })}
          {sortedDoctors.length > 3 && (
            <Tooltip key="more-doctors">
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background cursor-pointer">
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                    +{sortedDoctors.length - 3}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col gap-1">
                  {sortedDoctors.slice(3).map((doctor) => {
                    const doctorName =
                      `${doctor.firstName} ${doctor.lastName}`.trim();
                    const doctorTitle = doctor.title?.name;
                    const tooltipContent = doctorTitle
                      ? `${doctorName}, ${doctorTitle}`
                      : doctorName;

                    return <span key={doctor.id}>{tooltipContent}</span>;
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата создания",
    enableSorting: true,
    cell: ({ row }) => {
      const patient = row.original;
      const date = new Date(patient.createdAt);
      return <div className="text-sm">{date.toLocaleDateString("ru-RU")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const patient = row.original;
      const statusText = getPatientDisplayStatus(patient.status);

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
        <Badge variant={getStatusVariant(patient.status)}>{statusText}</Badge>
      );
    },
  },
];

export const employeePatientColumns: ColumnDef<PatientResponseDto>[] = [
  {
    accessorKey: "firstName",
    header: "Пациент",
    enableSorting: true,
    cell: ({ row }) => {
      const patient = row.original;
      const fullName = getPatientFullName(patient);
      const initials = getPatientInitials(patient);

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">
              {patient.patientId || "Без ID"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "Информация",
    cell: ({ row }) => {
      const patient = row.original;
      const info = formatPatientInfo(patient);
      const phone = getPatientPrimaryPhone(patient);

      return (
        <div>
          <div className="font-medium">{info}</div>
          {phone && (
            <div className="text-sm text-muted-foreground">{phone}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Телефон",
    cell: ({ row }) => {
      const patient = row.original;
      const phone = getPatientPrimaryPhone(patient);
      return <div>{phone || "Не указан"}</div>;
    },
  },
  {
    accessorKey: "lastVisitedAt",
    header: "Последний визит",
    cell: ({ row }) => {
      const patient = row.original;
      return patient.lastVisitedAt ? (
        <div className="flex items-center whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {formatDate(patient.lastVisitedAt, "dd.MM.yyyy")}
        </div>
      ) : (
        <span className="text-muted-foreground">Не посещал</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const patient = row.original;
      const statusDisplay = getPatientDisplayStatus(patient.status);
      return (
        <Badge variant={patient.status === "ACTIVE" ? "default" : "secondary"}>
          {statusDisplay}
        </Badge>
      );
    },
  },
];
