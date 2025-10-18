import { Badge } from "@/components/ui/badge";
import { LAB_STATUS_LABELS, LAB_STATUS_COLORS } from "../lab-order.constants";
import type { LabStatus } from "../lab-order.dto";

type LabOrderStatusBadgeProps = {
  status: LabStatus;
};

export const LabOrderStatusBadge = ({ status }: LabOrderStatusBadgeProps) => {
  const variant = LAB_STATUS_COLORS[status] || "default";
  const label = LAB_STATUS_LABELS[status] || status;

  return <Badge variant={variant}>{label}</Badge>;
};
