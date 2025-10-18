'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Copy,
  Eye,
  EyeOff 
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ProtocolTemplateResponseDto } from '@/features/protocol-template';

interface ProtocolsTableProps {
  protocols: ProtocolTemplateResponseDto[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}

export function ProtocolsTable({
  protocols,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
}: ProtocolsTableProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      router.push(`/cabinet/settings/protocols/${id}/edit`);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!isClient) return '—';
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: ru });
    } catch {
      return '—';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead>Дата обновления</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {protocols.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Нет доступных шаблонов протоколов
              </TableCell>
            </TableRow>
          ) : (
            protocols.map((protocol) => (
              <TableRow key={protocol.id}>
                <TableCell className="font-medium">{protocol.name}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {protocol.description}
                </TableCell>
                <TableCell>
                  <Badge variant={protocol.isActive ? 'default' : 'secondary'}>
                    {protocol.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(protocol.createdAt)}
                </TableCell>
                <TableCell>
                  {formatDate(protocol.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Открыть меню</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(protocol.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDuplicate?.(protocol.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Дублировать
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onToggleActive?.(protocol.id, !protocol.isActive)}
                      >
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
                        onClick={() => onDelete?.(protocol.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}