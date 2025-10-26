import type { OrderStatus, PaymentStatus } from "../service-order.dto";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../service-order.constants";
import { Badge } from "@/components/ui/badge";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const label = ORDER_STATUS_LABELS[status];

  const variant = {
    ORDERED: "default" as const,
    IN_PROGRESS: "secondary" as const,
    COMPLETED: "outline" as const,
    CANCELLED: "destructive" as const,
  }[status];

  return (
    <Badge variant={variant} className="gap-1">
      {label}
    </Badge>
  );
};

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const label = PAYMENT_STATUS_LABELS[status];

  const variant = {
    UNPAID: "destructive" as const,
    PAID: "default" as const,
    PARTIALLY_PAID: "secondary" as const,
    REFUNDED: "outline" as const,
  }[status];

  return (
    <Badge variant={variant} className="gap-1">
      {label}
    </Badge>
  );
};
