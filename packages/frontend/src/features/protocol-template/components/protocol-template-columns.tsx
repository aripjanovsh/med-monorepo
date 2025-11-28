import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { ProtocolTemplateResponseDto } from "../protocol-template.dto";
import {
  formatProtocolTemplateDate,
  getProtocolTemplateStatusLabel,
  getProtocolTemplateStatusVariant,
} from "../protocol-template.model";

export const protocolTemplateColumns: ColumnDef<ProtocolTemplateResponseDto>[] =
  [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Статус",
      size: 140,
      cell: ({ row }) => {
        const protocol = row.original;
        return (
          <Badge variant={getProtocolTemplateStatusVariant(protocol.isActive)}>
            {getProtocolTemplateStatusLabel(protocol.isActive)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Дата обновления",
      size: 140,
      cell: ({ row }) => formatProtocolTemplateDate(row.original.updatedAt),
    },
  ];
