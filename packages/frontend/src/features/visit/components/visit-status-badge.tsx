import { CheckCircle, Clock, Loader, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VISIT_STATUS_LABELS } from "../visit.constants";
import type { VisitStatus } from "../visit.constants";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type StatusConfig = {
  icon: typeof Clock;
  variant: BadgeVariant;
  className?: string;
};

const STATUS_CONFIG: Record<VisitStatus, StatusConfig> = {
  WAITING: {
    icon: Clock,
    variant: "secondary",
    className: "text-amber-600 dark:text-amber-400",
  },
  IN_PROGRESS: {
    icon: Loader,
    variant: "default",
    className: "text-white dark:text-white",
  },
  COMPLETED: {
    icon: CheckCircle,
    variant: "outline",
    className: "text-green-600 dark:text-green-400",
  },
  CANCELED: {
    icon: XCircle,
    variant: "destructive",
    className: "text-white",
  },
};

type VisitStatusBadgeProps = {
  status: VisitStatus;
};

export const VisitStatusBadge = ({ status }: VisitStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const label = VISIT_STATUS_LABELS[status] ?? status;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5 rounded-full", config.className)}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          status === "IN_PROGRESS" && "animate-spin"
        )}
      />
      {label}
    </Badge>
  );
};
