import {
  AlertCircle,
  CheckCircle,
  ClockAlert,
  CornerUpLeft,
} from "lucide-react";

import type { PaymentStatus } from "../invoice.dto";
import { PAYMENT_STATUS_MAP } from "../invoice.constants";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT_MAP: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  red: "destructive",
  orange: "default",
  green: "secondary",
  gray: "outline",
};

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    icon:
      | typeof AlertCircle
      | typeof CheckCircle
      | typeof ClockAlert
      | typeof CornerUpLeft;
    className?: string;
  }
> = {
  UNPAID: {
    icon: AlertCircle,
  },
  PARTIALLY_PAID: {
    icon: ClockAlert,
  },
  PAID: {
    icon: CheckCircle,
    className: "text-green-600 dark:text-green-400",
  },
  REFUNDED: {
    icon: CornerUpLeft,
    className: "text-muted-foreground",
  },
};

type InvoiceStatusBadgeProps = {
  status: PaymentStatus;
};

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const statusInfo = PAYMENT_STATUS_MAP[status];
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={STATUS_VARIANT_MAP[statusInfo.color] ?? "secondary"}
      className={`gap-1.5 rounded-full ${config.className ?? ""}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {statusInfo.label}
    </Badge>
  );
};
