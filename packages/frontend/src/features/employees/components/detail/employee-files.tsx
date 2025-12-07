"use client";

import { useState, useMemo, useCallback } from "react";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { FileIcon, Upload, Download, Trash2, Eye } from "lucide-react";

import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import {
  useGetFilesQuery,
  useDeleteFileMutation,
  fileHelpers,
  FileCategory,
  FileEntityType,
  EMPLOYEE_FILE_CATEGORIES,
  type FileResponseDto,
  UploadFileSheet,
  FilePreviewDialog,
  fileColumns,
} from "@/features/file";
import { DataTable, DataTableEmptyState } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layouts/page-header";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs/use-confirm-dialog";
import { useAppSelector } from "@/store";

type EmployeeFilesProps = {
  employee: EmployeeResponseDto;
};

export const EmployeeFiles = ({ employee }: EmployeeFilesProps) => {
  const uploadDialog = useDialog(UploadFileSheet);
  const confirm = useConfirmDialog();
  const token = useAppSelector((state) => state.auth.token);
  const [previewFile, setPreviewFile] = useState<FileResponseDto | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // DataTable state management
  const filesState = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [
      {
        desc: true,
        id: "createdAt",
      },
    ],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  const { data, isLoading, refetch } = useGetFilesQuery(
    {
      entityType: FileEntityType.EMPLOYEE,
      entityId: employee.id,
      ...filesState.queryParams,
    },
    { skip: !employee.id }
  );

  const [deleteFile] = useDeleteFileMutation();

  const files = data?.data || [];
  const totalFiles = data?.total || 0;

  const handleUploadClick = useCallback(() => {
    uploadDialog.open({
      entityType: FileEntityType.EMPLOYEE,
      entityId: employee.id,
      allowedCategories: EMPLOYEE_FILE_CATEGORIES as unknown as FileCategory[],
      defaultCategory: FileCategory.GENERAL,
      onSuccess: () => {
        refetch();
      },
    });
  }, [uploadDialog, employee.id, refetch]);

  const handlePreview = useCallback((file: FileResponseDto) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  }, []);

  const handleDownload = useCallback(
    async (file: FileResponseDto) => {
      if (!token) {
        toast.error("Не удалось скачать файл");
        return;
      }

      try {
        await fileHelpers.downloadFile(file.id, file.filename, token);
        toast.success("Файл успешно скачан");
      } catch (error) {
        toast.error("Ошибка при скачивании файла");
      }
    },
    [token]
  );

  const handleDeleteClick = useCallback(
    (file: FileResponseDto) => {
      confirm({
        title: "Удалить файл?",
        description: `Вы уверены, что хотите удалить файл "${file.filename}"? Это действие нельзя отменить.`,
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteFile(file.id).unwrap();
            toast.success("Файл успешно удален");
          } catch (error) {
            toast.error("Ошибка при удалении файла");
          }
        },
      });
    },
    [confirm, deleteFile]
  );

  const columns = useMemo(
    () => [
      ...fileColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        cell: ({ row }: { row: any }) => {
          const file = row.original;
          return (
            <div className="text-right flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(file);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Просмотр
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Скачать
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(file);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          );
        },
      },
    ],
    [handlePreview, handleDownload, handleDeleteClick]
  );

  return (
    <>
      <PageHeader
        title="Файлы сотрудника"
        actions={
          <Button onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Загрузить файл
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={files}
        isLoading={isLoading}
        pagination={{
          ...filesState.handlers.pagination,
          total: totalFiles,
        }}
        sort={filesState.handlers.sorting}
        emptyState={
          <DataTableEmptyState
            title="Нет файлов"
            description="У этого сотрудника пока нет загруженных файлов"
            icon={FileIcon}
          />
        }
      />

      <FilePreviewDialog
        file={previewFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
};
