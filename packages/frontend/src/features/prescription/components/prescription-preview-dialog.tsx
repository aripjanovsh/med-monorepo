"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Pill, Calendar, Clock, User, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getFrequencyLabel, getDurationLabel } from "../prescription.constants";
import type { PrescriptionResponseDto } from "../prescription.dto";

type PrescriptionPreviewDialogProps = {
  prescription: PrescriptionResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PrescriptionPreviewDialog = ({
  prescription,
  open,
  onOpenChange,
}: PrescriptionPreviewDialogProps) => {
  if (!prescription) return null;

  const createdByName = prescription.createdBy
    ? `${prescription.createdBy.lastName} ${prescription.createdBy.firstName?.charAt(0) ?? ""}.`
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Рецепт
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Medication Name & Dosage */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="font-semibold text-lg">{prescription.name}</p>
            {prescription.dosage && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Дозировка: {prescription.dosage}
              </p>
            )}
          </div>

          {/* Frequency & Duration */}
          <div className="grid grid-cols-2 gap-3">
            {prescription.frequency && (
              <div className="p-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  Частота
                </div>
                <p className="text-sm font-medium">
                  {getFrequencyLabel(prescription.frequency)}
                </p>
              </div>
            )}
            {prescription.duration && (
              <div className="p-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  Длительность
                </div>
                <p className="text-sm font-medium">
                  {getDurationLabel(prescription.duration)}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="p-2.5 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <FileText className="h-3 w-3" />
                Примечания
              </div>
              <p className="text-sm">{prescription.notes}</p>
            </div>
          )}

          <Separator />

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              {createdByName}
            </div>
            <div>
              {format(new Date(prescription.createdAt), "dd.MM.yyyy HH:mm", {
                locale: ru,
              })}
            </div>
          </div>

          {/* Visit Info */}
          {prescription.visit && (
            <div className="text-xs text-muted-foreground">
              Визит от{" "}
              {format(new Date(prescription.visit.visitDate), "dd.MM.yyyy", {
                locale: ru,
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
