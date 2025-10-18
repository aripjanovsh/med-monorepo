"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useGetProtocolTemplatesQuery,
  useDeleteProtocolTemplateMutation,
  useUpdateProtocolTemplateMutation,
  createProtocolTemplateColumns,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
} from "@/features/protocol-template";
import type { ProtocolTemplateResponseDto } from "@/features/protocol-template";

export default function ProtocolsPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetProtocolTemplatesQuery({
    page: DEFAULT_PAGE,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [deleteProtocol] = useDeleteProtocolTemplateMutation();
  const [updateProtocol] = useUpdateProtocolTemplateMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [protocolToDelete, setProtocolToDelete] =
    useState<ProtocolTemplateResponseDto | null>(null);

  const protocols = data?.data ?? [];

  const handleCreate = () => {
    router.push("/cabinet/settings/protocols/new");
  };

  const handleEdit = (protocol: ProtocolTemplateResponseDto) => {
    router.push(`/cabinet/settings/protocols/${protocol.id}/edit`);
  };

  const handleView = (protocol: ProtocolTemplateResponseDto) => {
    router.push(`/cabinet/settings/protocols/${protocol.id}/edit`);
  };

  const handleDelete = (protocol: ProtocolTemplateResponseDto) => {
    setProtocolToDelete(protocol);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!protocolToDelete) return;

    try {
      const result = await deleteProtocol(protocolToDelete.id).unwrap();
      toast.success(result.message ?? "Протокол успешно удален");
      setDeleteDialogOpen(false);
      setProtocolToDelete(null);
      refetch();
    } catch (error: any) {
      console.error("Error deleting protocol:", error);
      toast.error(error.data?.message ?? "Ошибка при удалении протокола");
    }
  };

  const handleDuplicate = async (protocol: ProtocolTemplateResponseDto) => {
    toast.info("Дублирование протоколов пока не реализовано");
  };

  const handleToggleActive = async (protocol: ProtocolTemplateResponseDto) => {
    try {
      await updateProtocol({
        id: protocol.id,
        data: { isActive: !protocol.isActive },
      }).unwrap();
      toast.success(
        protocol.isActive ? "Протокол деактивирован" : "Протокол активирован"
      );
      refetch();
    } catch (error: any) {
      console.error("Error toggling protocol status:", error);
      toast.error(error.data?.message ?? "Ошибка при изменении статуса");
    }
  };

  const columns = createProtocolTemplateColumns(
    handleEdit,
    handleView,
    handleDelete,
    handleDuplicate,
    handleToggleActive
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Шаблоны протоколов
          </h1>
          <p className="text-muted-foreground">
            Управление шаблонами медицинских протоколов
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push("/cabinet/settings/protocols/interactive")
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Интерактивная форма
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать протокол
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Загрузка протоколов...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <FileText className="h-12 w-12 text-destructive" />
            <p className="text-destructive">Ошибка при загрузке протоколов</p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id ?? (column as any).accessorKey}
                    className={
                      column.id === "actions" ? "text-right" : undefined
                    }
                  >
                    {typeof column.header === "function"
                      ? column.header({} as any)
                      : column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {protocols.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Нет доступных шаблонов протоколов
                  </TableCell>
                </TableRow>
              ) : (
                protocols.map((protocol) => (
                  <TableRow key={protocol.id}>
                    {columns.map((column) => {
                      const cell = column.cell;
                      return (
                        <TableCell key={column.id ?? (column as any).accessorKey}>
                          {typeof cell === "function"
                            ? cell({ row: { original: protocol } } as any)
                            : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Протокол будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
