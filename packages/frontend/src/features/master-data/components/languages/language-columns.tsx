"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
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
import { Language } from "@/features/master-data/master-data.types";

export function createLanguageColumns(
  onEdit: (language: Language) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (id: string) => void,
  isDeleting?: boolean,
  isToggling?: boolean
): ColumnDef<Language>[] {
  return [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "code",
      header: "Код",
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        return (
          <div className="font-mono text-sm">
            {code ? (
              <Badge variant="outline">{code.toUpperCase()}</Badge>
            ) : (
              "-"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "nativeName",
      header: "Родное название",
      cell: ({ row }) => {
        const nativeName = row.getValue("nativeName") as string;
        return (
          <div className="max-w-[200px] truncate">{nativeName || "-"}</div>
        );
      },
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
            {isActive ? "Активный" : "Неактивный"}
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
        const language = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(language)}>
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(language.id)}
              disabled={isToggling}
            >
              {language.isActive ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
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
                    Вы уверены, что хотите удалить язык &quot;{language.name}&quot;? Это
                    действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(language.id)}
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
