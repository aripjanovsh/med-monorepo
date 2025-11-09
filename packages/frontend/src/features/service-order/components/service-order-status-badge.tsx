import {
  CheckCircle,
  Loader2,
  Clock,
  XCircle,
  DollarSign,
  AlertCircle,
  ClockAlert,
  CornerUpLeft,
} from "lucide-react";

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

  const config = {
    ORDERED: {
      variant: "outline" as const,
      icon: Clock,
      className: "text-blue-600 dark:text-blue-400",
    },
    IN_PROGRESS: {
      variant: "outline" as const,
      icon: Loader2,
      className: "text-amber-600 dark:text-amber-400",
    },
    COMPLETED: {
      variant: "outline" as const,
      icon: CheckCircle,
      className: "text-green-600 dark:text-green-400",
    },
    CANCELLED: {
      variant: "destructive" as const,
      icon: XCircle,
      className: "",
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`gap-1.5 rounded-full ${config.className}`}
    >
      <Icon />
      {label}
    </Badge>
  );
};

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const label = PAYMENT_STATUS_LABELS[status];

  const config = {
    UNPAID: {
      variant: "outline" as const,
      icon: AlertCircle,
      className: "",
    },
    PAID: {
      variant: "outline" as const,
      icon: CheckCircle,
      className: "text-green-600 dark:text-green-400",
    },
    PARTIALLY_PAID: {
      variant: "outline" as const,
      icon: ClockAlert,
      className: "text-amber-600 dark:text-amber-400",
    },
    REFUNDED: {
      variant: "outline" as const,
      icon: CornerUpLeft,
      className: "text-gray-600 dark:text-gray-400",
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`gap-1.5 rounded-full ${config.className}`}
    >
      <Icon />
      {label}
    </Badge>
  );
};
