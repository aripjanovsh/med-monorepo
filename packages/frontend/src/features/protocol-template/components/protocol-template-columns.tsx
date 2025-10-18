import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import type { ProtocolTemplateResponseDto } from "../protocol-template.dto";
import {
  formatProtocolTemplateDate,
  getProtocolTemplateStatusLabel,
  getProtocolTemplateStatusVariant,
} from "../protocol-template.model";

export const createProtocolTemplateColumns = (
  onEdit?: (protocol: ProtocolTemplateResponseDto) => void,
  onView?: (protocol: ProtocolTemplateResponseDto) => void,
  onDelete?: (protocol: ProtocolTemplateResponseDto) => void,
  onDuplicate?: (protocol: ProtocolTemplateResponseDto) => void,
  onToggleActive?: (protocol: ProtocolTemplateResponseDto) => void
): ColumnDef<ProtocolTemplateResponseDto>[] => [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => {
      const protocol = row.original;
      return (
        <button
          onClick={() => onView?.(protocol)}
          className="font-medium text-left hover:underline"
        >
          {protocol.name}
        </button>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Описание",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">{row.original.description}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Статус",
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
    accessorKey: "createdAt",
    header: "Дата создания",
    cell: ({ row }) => formatProtocolTemplateDate(row.original.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: "Дата обновления",
    cell: ({ row }) => formatProtocolTemplateDate(row.original.updatedAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Действия</div>,
    cell: ({ row }) => {
      const protocol = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Открыть меню</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit?.(protocol)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(protocol)}>
                <Copy className="mr-2 h-4 w-4" />
                Дублировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive?.(protocol)}>
                {protocol.isActive ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Деактивировать
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Активировать
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(protocol)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
