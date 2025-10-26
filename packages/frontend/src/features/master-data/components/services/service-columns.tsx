"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Service, ServiceTypeEnumFrontend } from "@/features/master-data/master-data.types";

const SERVICE_TYPE_LABELS: Record<ServiceTypeEnumFrontend, string> = {
  [ServiceTypeEnumFrontend.CONSULTATION]: "Консультация",
  [ServiceTypeEnumFrontend.LAB]: "Лабораторные анализы",
  [ServiceTypeEnumFrontend.DIAGNOSTIC]: "Диагностика",
  [ServiceTypeEnumFrontend.PROCEDURE]: "Процедура",
  [ServiceTypeEnumFrontend.OTHER]: "Прочее",
};

export function createServiceColumns(
  onEdit: (service: Service) => void,
  onDelete: (id: string) => void,
  isDeleting?: boolean
): ColumnDef<Service>[] {
  return [
    {
      accessorKey: "code",
      header: "Код",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        const type = row.getValue("type") as ServiceTypeEnumFrontend;
        return (
          <Badge variant="outline">
            {SERVICE_TYPE_LABELS[type] || type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Отделение",
      cell: ({ row }) => {
        const department = row.original.department;
        return (
          <div className="text-sm">{department?.name || "-"}</div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Цена",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return (
          <div className="text-sm">
            {price ? `${price.toLocaleString("ru-RU")} сум` : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "durationMin",
      header: "Длительность",
      cell: ({ row }) => {
        const duration = row.getValue("durationMin") as number;
        return (
          <div className="text-sm">{duration ? `${duration} мин` : "-"}</div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Статус",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Активна" : "Неактивна"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => {
        const service = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(service)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите удалить услугу "{service.name}"?
                    Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(service.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Удаление..." : "Удалить"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}
