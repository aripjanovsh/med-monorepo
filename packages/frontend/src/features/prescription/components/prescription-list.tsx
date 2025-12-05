"use client";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import {
  useGetPrescriptionsByVisitQuery,
  useDeletePrescriptionMutation,
} from "../prescription.api";
import { getFrequencyLabel, getDurationLabel } from "../prescription.constants";
import type { VisitStatus } from "@/features/visit/visit.constants";

type PrescriptionListProps = {
  visitId: string;
  status: VisitStatus;
};

export const PrescriptionList = ({
  visitId,
  status,
}: PrescriptionListProps) => {
  const { data: prescriptions, isLoading } =
    useGetPrescriptionsByVisitQuery(visitId);
  const [deletePrescription] = useDeletePrescriptionMutation();

  const isEditable = status === "IN_PROGRESS";

  const handleCancel = async (id: string) => {
    if (!confirm("Отменить рецепт?")) return;

    try {
      await deletePrescription(id).unwrap();
      toast.success("Рецепт отменен");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage ?? "Ошибка при отмене");
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="border-b pb-3 last:border-0 space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-base">
                    {prescription.name}{" "}
                    {prescription.dosage && `${prescription.dosage}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {prescription.frequency &&
                      getFrequencyLabel(prescription.frequency)}
                    {prescription.frequency && prescription.duration && ". "}
                    {prescription.duration &&
                      getDurationLabel(prescription.duration)}
                  </p>
                  {prescription.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      {prescription.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(prescription.createdAt),
                      "dd.MM.yyyy HH:mm",
                      {
                        locale: ru,
                      }
                    )}
                  </p>
                </div>
                {isEditable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(prescription.id)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <Trash className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Назначений пока нет</p>
      )}
    </>
  );
};
