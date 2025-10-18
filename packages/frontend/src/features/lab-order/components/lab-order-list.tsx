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

import { useGetLabOrdersByVisitQuery, useDeleteLabOrderMutation } from "../lab-order.api";
import { LabOrderForm } from "./lab-order-form";
import { LabOrderStatusBadge } from "./lab-order-status-badge";
import type { VisitStatus } from "@/features/visit/visit.dto";

type LabOrderListProps = {
  visitId: string;
  employeeId: string;
  status: VisitStatus;
};

export const LabOrderList = ({
  visitId,
  employeeId,
  status,
}: LabOrderListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: labOrders, isLoading } = useGetLabOrdersByVisitQuery(visitId);
  const [deleteLabOrder] = useDeleteLabOrderMutation();

  const isEditable = status === "IN_PROGRESS";

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить направление?")) return;

    try {
      await deleteLabOrder(id).unwrap();
      toast.success("Направление удалено");
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
        <h3 className="text-lg font-medium">Направления на анализы</h3>
        {isEditable && (
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Добавить направление
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Анализ</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата создания</TableHead>
            {isEditable && <TableHead className="w-20">Действия</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {labOrders && labOrders.length > 0 ? (
            labOrders.map((labOrder) => (
              <TableRow key={labOrder.id}>
                <TableCell className="font-medium">{labOrder.testName}</TableCell>
                <TableCell>
                  <LabOrderStatusBadge status={labOrder.status} />
                </TableCell>
                <TableCell>
                  {format(new Date(labOrder.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: ru,
                  })}
                </TableCell>
                {isEditable && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(labOrder.id)}
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isEditable ? 4 : 3} className="text-center text-muted-foreground">
                Направлений пока нет
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить направление на анализ</DialogTitle>
          </DialogHeader>
          <LabOrderForm
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
