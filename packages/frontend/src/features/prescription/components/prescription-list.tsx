"use client";

import { useState, useCallback } from "react";
import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

import {
  useGetPrescriptionsByVisitQuery,
  useDeletePrescriptionMutation,
} from "../prescription.api";
import { getFrequencyLabel, getDurationLabel } from "../prescription.constants";
import { PrescriptionPreviewDialog } from "./prescription-preview-dialog";
import type { PrescriptionResponseDto } from "../prescription.dto";
import type { VisitStatus } from "@/features/visit/visit.constants";

type PrescriptionListProps = {
  visitId: string;
  status: VisitStatus;
};

export const PrescriptionList = ({
  visitId,
  status,
}: PrescriptionListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewPrescription, setPreviewPrescription] =
    useState<PrescriptionResponseDto | null>(null);

  const { data: prescriptions, isLoading } =
    useGetPrescriptionsByVisitQuery(visitId);
  const [deletePrescription, { isLoading: isDeleting }] =
    useDeletePrescriptionMutation();

  const isEditable = status === "IN_PROGRESS";

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      await deletePrescription(deleteId).unwrap();
      toast.success("Рецепт удален");
      setDeleteId(null);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage ?? "Ошибка при удалении");
    }
  }, [deleteId, deletePrescription]);

  const handlePreview = useCallback((prescription: PrescriptionResponseDto) => {
    setPreviewPrescription(prescription);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Загрузка...
      </div>
    );
  }

  return (
    <>
      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-1.5">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {prescription.name}
                  {prescription.dosage && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      {prescription.dosage}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                  {prescription.frequency && (
                    <span>{getFrequencyLabel(prescription.frequency)}</span>
                  )}
                  {prescription.frequency && prescription.duration && (
                    <span>•</span>
                  )}
                  {prescription.duration && (
                    <span>{getDurationLabel(prescription.duration)}</span>
                  )}
                </div>
                {prescription.notes && (
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-1 italic">
                    {prescription.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handlePreview(prescription)}
                  title="Просмотреть"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                {isEditable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(prescription.id)}
                    title="Удалить"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-1">Рецептов пока нет</p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить рецепт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Рецепт будет удален.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <PrescriptionPreviewDialog
        prescription={previewPrescription}
        open={!!previewPrescription}
        onOpenChange={(open) => !open && setPreviewPrescription(null)}
      />
    </>
  );
};
