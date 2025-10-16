"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PatientResponseDto } from "../patient.dto";
import {
  getPatientFullName,
  calculatePatientAge,
  getPatientDisplayStatus,
  getPatientPrimaryPhone,
  formatPatientInfo,
  getPatientLastVisit,
} from "../patient.model";
import Link from "next/link";

export interface PatientTableActions {
  onDelete: (patient: PatientResponseDto) => void;
}

export const createPatientColumns = (
  actions: PatientTableActions
): ColumnDef<PatientResponseDto>[] => [
  {
    accessorKey: "patientInfo",
    header: "Пациент",
    cell: ({ row }) => {
      const patient = row.original;
      const fullName = getPatientFullName(patient);
      const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/cabinet/patients/${patient.id}`}
              className="font-medium"
            >
              {fullName}
            </Link>
            <div className="text-sm text-muted-foreground">
              {patient.patientId || "Без ID"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "info",
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
  {
    accessorKey: "lastVisit",
    header: "Последний визит",
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
    cell: ({ row }) => {
      const patient = row.original;
      const date = new Date(patient.createdAt);
      return <div className="text-sm">{date.toLocaleDateString("ru-RU")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/cabinet/patients/${patient.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Просмотр
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/cabinet/patients/${patient.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actions.onDelete(patient)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
