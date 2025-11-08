"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import type { AnalysisTemplateResponseDto } from "../analysis-template.dto";

export const analysisTemplateColumns: ColumnDef<AnalysisTemplateResponseDto>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "code",
    header: "Код",
    cell: ({ row }) => <Badge variant="outline">{row.original.code}</Badge>,
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
];
