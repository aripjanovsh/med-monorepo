"use client";

import { useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/lib/dialog-manager";
import { AddServicesDialog } from "./add-services-dialog";

type AddServicesButtonProps = {
  visitId: string;
  patientId: string;
  doctorId: string;
};

/**
 * Кнопка добавления услуг через Dialog Manager
 * 
 * @deprecated Используйте AddServicesDialog напрямую с useDialog хуком
 * Этот компонент сохранен для обратной совместимости
 */
export const AddServicesButton = ({
  visitId,
  patientId,
  doctorId,
}: AddServicesButtonProps) => {
  const addServicesDialog = useDialog(AddServicesDialog);

  const handleClick = useCallback(() => {
    addServicesDialog.open({
      visitId,
      patientId,
      doctorId,
    });
  }, [addServicesDialog, visitId, patientId, doctorId]);

  return (
    <Button onClick={handleClick} size="sm" variant="outline">
      <Plus className="h-4 w-4 mr-2" />
      Добавить
    </Button>
  );
};
