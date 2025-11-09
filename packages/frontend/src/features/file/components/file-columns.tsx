import type { ColumnDef } from "@tanstack/react-table";

import type { FileResponseDto } from "../file.dto";
import { FILE_CATEGORY_LABELS } from "../file.constants";
import { getEmployeeShortName } from "@/features/employees";
import { formatDate } from "@/lib/date.utils";
import { formatFileSize } from "@/lib/file.utils";

export const fileColumns: ColumnDef<FileResponseDto>[] = [
  {
    accessorKey: "filename",
    header: "Файл",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.filename}</div>
        {row.original.title && (
          <div className="text-sm text-muted-foreground">
            {row.original.title}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Категория",
    cell: ({ row }) => (
      <div>{FILE_CATEGORY_LABELS[row.original.category]}</div>
    ),
  },
  {
    accessorKey: "size",
    header: "Размер",
    cell: ({ row }) => <div>{formatFileSize(row.original.size)}</div>,
  },
  {
    accessorKey: "uploadedBy",
    header: "Загрузил",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.uploadedBy
          ? getEmployeeShortName(row.original.uploadedBy)
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "uploadedAt",
    header: "Дата загрузки",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.original.uploadedAt, "dd.MM.yyyy HH:mm")}
      </div>
    ),
  },
];
