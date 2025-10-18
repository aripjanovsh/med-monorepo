"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { useGetPrescriptionsByVisitQuery, useDeletePrescriptionMutation } from "../prescription.api";
import { PrescriptionForm } from "./prescription-form";
import { getFrequencyLabel, getDurationLabel } from "../prescription.constants";
import type { VisitStatus } from "@/features/visit/visit.dto";

type PrescriptionListProps = {
  visitId: string;
  employeeId: string;
  status: VisitStatus;
};

export const PrescriptionList = ({
  visitId,
  employeeId,
  status,
}: PrescriptionListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: prescriptions, isLoading } = useGetPrescriptionsByVisitQuery(visitId);
  const [deletePrescription] = useDeletePrescriptionMutation();

  const isEditable = status === "IN_PROGRESS";

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить назначение?")) return;

    try {
      await deletePrescription(id).unwrap();
      toast.success("Назначение удалено");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при удалении");
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Назначения</h3>
        {isEditable && (
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Добавить назначение
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Препарат</TableHead>
            <TableHead>Дозировка</TableHead>
            <TableHead>Частота</TableHead>
            <TableHead>Длительность</TableHead>
            <TableHead>Дата</TableHead>
            {isEditable && <TableHead className="w-20">Действия</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions && prescriptions.length > 0 ? (
            prescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell className="font-medium">{prescription.name}</TableCell>
                <TableCell>{prescription.dosage || "—"}</TableCell>
                <TableCell>
                  {prescription.frequency ? getFrequencyLabel(prescription.frequency) : "—"}
                </TableCell>
                <TableCell>
                  {prescription.duration ? getDurationLabel(prescription.duration) : "—"}
                </TableCell>
                <TableCell>
                  {format(new Date(prescription.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: ru,
                  })}
                </TableCell>
                {isEditable && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(prescription.id)}
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isEditable ? 6 : 5} className="text-center text-muted-foreground">
                Назначений пока нет
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить назначение</DialogTitle>
          </DialogHeader>
          <PrescriptionForm
            visitId={visitId}
            employeeId={employeeId}
            onSuccess={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
