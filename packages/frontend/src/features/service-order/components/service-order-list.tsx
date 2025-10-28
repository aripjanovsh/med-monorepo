"use client";

import { useState } from "react";
import { Trash2, Eye } from "lucide-react";
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
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./service-order-status-badge";
import {
  useGetServiceOrdersQuery,
  useDeleteServiceOrderMutation,
} from "../service-order.api";
import { canCancelOrder } from "../service-order.model";

type ServiceOrderListProps = {
  visitId: string;
  isEditable?: boolean;
};

export const ServiceOrderList = ({
  visitId,
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
    <>
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
                      </div>
                    </TableCell>
                    <TableCell>{order.department?.name || "—"}</TableCell>
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
    </>
  );
};
