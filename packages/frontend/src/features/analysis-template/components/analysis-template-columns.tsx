"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AnalysisTemplateResponseDto } from "../analysis-template.dto";

export const createAnalysisTemplateColumns = (
  onView?: (template: AnalysisTemplateResponseDto) => void,
  onEdit?: (template: AnalysisTemplateResponseDto) => void,
  onDelete?: (template: AnalysisTemplateResponseDto) => void
): ColumnDef<AnalysisTemplateResponseDto>[] => [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => {
      const template = row.original;

      return (
        <button
          onClick={() => onView?.(template)}
          className="text-left hover:underline font-medium"
        >
          {template.name}
        </button>
      );
    },
  },
  {
    accessorKey: "code",
    header: "Код",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.code}</Badge>
    ),
  },
  {
    accessorKey: "parameters",
    header: "Параметров",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.parameters.length}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Описание",
    cell: ({ row }) => (
      <span className="text-muted-foreground truncate max-w-xs block">
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const template = row.original;

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(template)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(template)}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(template)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
