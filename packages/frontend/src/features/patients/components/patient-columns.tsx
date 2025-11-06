"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientResponseDto } from "../patient.dto";
import {
  getPatientFullName,
  getPatientDisplayStatus,
  getPatientInitials,
  getPatientPrimaryPhone,
  formatPatientInfo,
  getPatientLastVisit,
} from "../patient.model";

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
    accessorKey: "lastVisit",
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

      if (activeDoctors.length === 0) {
        return (
          <div className="text-sm text-muted-foreground">Не назначены</div>
        );
      }

      return (
        <div className="text-sm">
          {activeDoctors.slice(0, 2).map((doctor, index) => (
            <div key={doctor.id}>
              {doctor.firstName} {doctor.lastName}
            </div>
          ))}
          {activeDoctors.length > 2 && (
            <div className="text-muted-foreground">
              +{activeDoctors.length - 2} еще
            </div>
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
