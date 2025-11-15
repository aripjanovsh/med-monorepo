"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import type {
  AnalysisTemplateResponseDto,
  AnalysisTemplateContentDto,
} from "../analysis-template.dto";

const getParametersCount = (content: string): number => {
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      // Старый формат
      return data.length;
    }
    // Новый формат с секциями
    return (data as AnalysisTemplateContentDto).sections.reduce(
      (total, section) => total + section.parameters.length,
      0,
    );
  } catch {
    return 0;
  }
};

export const analysisTemplateColumns: ColumnDef<AnalysisTemplateResponseDto>[] =
  [
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
      accessorKey: "content",
      header: "Параметров",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {getParametersCount(row.original.content)}
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
