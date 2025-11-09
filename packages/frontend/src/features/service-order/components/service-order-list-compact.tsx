"use client";

import { useState } from "react";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDialog } from "@/lib/dialog-manager";
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
import { ServiceOrderResultSheet } from "./service-order-result-dialog";
import type { ServiceOrderResponseDto } from "../service-order.dto";

type ServiceOrderListCompactProps = {
  visitId: string;
  isEditable?: boolean;
};

export const ServiceOrderListCompact = ({
  visitId,
  isEditable = true,
}: ServiceOrderListCompactProps) => {
  const router = useRouter();
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const resultSheet = useDialog(ServiceOrderResultSheet);

  const { data, isLoading } = useGetServiceOrdersQuery({
    visitId,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [deleteOrder, { isLoading: isDeleting }] =
    useDeleteServiceOrderMutation();

  const orders = data?.data ?? [];

  const handleViewResult = (order: ServiceOrderResponseDto) => {
    resultSheet.open({
      order,
      onEdit: isEditable
        ? () => {
            router.push(`/cabinet/orders/${order.id}/execute`);
            resultSheet.close();
          }
        : undefined,
    });
  };

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
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Загрузка...
      </div>
    );
  }

  return (
    <>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет назначений</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-start justify-between border-b pb-3 last:border-0 gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight mb-1 truncate">
                  {order.service.name}
                </p>
                {order.department && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {order.department.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {order.status === "COMPLETED" &&
                  (order.resultText || order.resultData) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleViewResult(order)}
                      title="Просмотреть результат"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                {canCancelOrder(order) && isEditable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDeleteOrderId(order.id)}
                    title="Удалить"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
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
