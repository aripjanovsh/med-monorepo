"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { ProtocolsTable } from "@/components/protocols/protocols-table";
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
} from "@/features/protocol-templates/protocol-template.api";

export default function ProtocolsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetProtocolTemplatesQuery({ page: 1, limit: 100 });
  const [deleteProtocol] = useDeleteProtocolTemplateMutation();
  const [updateProtocol] = useUpdateProtocolTemplateMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [protocolToDelete, setProtocolToDelete] = useState<string | null>(null);

  const protocols = data?.data || [];

  const handleCreate = () => {
    router.push("/cabinet/settings/protocols/new");
  };

  const handleEdit = (id: string) => {
    router.push(`/cabinet/settings/protocols/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setProtocolToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!protocolToDelete) return;

    try {
      const result = await deleteProtocol(protocolToDelete).unwrap();
      if (result.success) {
        toast.success(result.message || "Протокол успешно удален");
        setDeleteDialogOpen(false);
        setProtocolToDelete(null);
      }
    } catch (error: any) {
      console.error("Error deleting protocol:", error);
      toast.error(error.data?.message || "Ошибка при удалении протокола");
    }
  };

  const handleDuplicate = async (id: string) => {
    toast.info("Дублирование протоколов пока не реализовано");
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const result = await updateProtocol({
        id,
        data: { isActive: !isActive },
      }).unwrap();
      if (result.success) {
        toast.success(
          isActive
            ? "Протокол деактивирован"
            : "Протокол активирован"
        );
      }
    } catch (error: any) {
      console.error("Error toggling protocol status:", error);
      toast.error(error.data?.message || "Ошибка при изменении статуса");
    }
  };

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
        <ProtocolsTable
          protocols={protocols}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onToggleActive={handleToggleActive}
        />
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
