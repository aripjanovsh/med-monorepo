"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import { PrescriptionForm } from "./prescription-form";

/**
 * Пропсы для AddPrescriptionDialog (без базовых DialogProps)
 */
type AddPrescriptionDialogOwnProps = {
  visitId: string;
  employeeId: string;
};

/**
 * Полные пропсы с DialogProps
 */
type AddPrescriptionDialogProps = AddPrescriptionDialogOwnProps & DialogProps;

export const AddPrescriptionDialog = ({
  visitId,
  employeeId,
  open,
  onOpenChange,
}: AddPrescriptionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить назначение</DialogTitle>
        </DialogHeader>
        <PrescriptionForm
          visitId={visitId}
          employeeId={employeeId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
