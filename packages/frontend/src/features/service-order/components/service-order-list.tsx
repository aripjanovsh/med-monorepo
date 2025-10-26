"use client";

import { useState } from "react";
import { Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { OrderStatusBadge, PaymentStatusBadge } from "./service-order-status-badge";
import {
  useGetServiceOrdersQuery,
  useDeleteServiceOrderMutation,
} from "../service-order.api";
import { canCancelOrder, calculateUnpaidTotal } from "../service-order.model";
import type { ServiceOrderResponseDto } from "../service-order.dto";

type ServiceOrderListProps = {
  visitId: string;
  onAddServices: () => void;
  isEditable?: boolean;
};

export const ServiceOrderList = ({
  visitId,
  onAddServices,
  isEditable = true,
}: ServiceOrderListProps) => {
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const { data, isLoading } = useGetServiceOrdersQuery({
    visitId,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [deleteOrder, { isLoading: isDeleting }] =
    useDeleteServiceOrderMutation();

  const orders = data?.data ?? [];
  const unpaidTotal = calculateUnpaidTotal(orders);

  const handleDelete = async () => {
    if (!deleteOrderId) return;

    try {
      await deleteOrder(deleteOrderId).unwrap();
      toast.success("Назначение удалено");
      setDeleteOrderId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при удалении");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Назначения и услуги</h3>
        {isEditable && (
          <Button onClick={onAddServices} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Добавить услуги
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Нет назначений
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Услуга</TableHead>
                  <TableHead>Отделение</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Оплата</TableHead>
                  <TableHead>Результат</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.service.name}</div>
                        {order.service.code && (
                          <div className="text-sm text-muted-foreground">
                            {order.service.code}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {Number(order.service.price).toLocaleString()} сум
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.department?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      {order.status === "COMPLETED" && order.resultText ? (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {canCancelOrder(order) && isEditable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteOrderId(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {unpaidTotal > 0 && (
            <div className="flex justify-end items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ожидает оплаты:</span>
              <span className="font-semibold text-lg">
                {unpaidTotal.toLocaleString()} сум
              </span>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={deleteOrderId !== null}
        onOpenChange={(open) => !open && setDeleteOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить назначение?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Назначение будет удалено.
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
    </div>
  );
};
