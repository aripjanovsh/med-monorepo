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
import { Title } from "@/features/master-data/master-data.types";

export function createTitleColumns(
  onEdit: (title: Title) => void,
  onDelete: (id: string) => void,
  isDeleting?: boolean
): ColumnDef<Title>[] {
  return [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[300px] truncate">{description || "-"}</div>
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
            {isActive ? "Активная" : "Неактивная"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Дата создания",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return new Date(date).toLocaleDateString("ru-RU");
      },
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => {
        const title = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(title)}>
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
                    Вы уверены, что хотите удалить должность "{title.name}"? Это
                    действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(title.id)}
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
