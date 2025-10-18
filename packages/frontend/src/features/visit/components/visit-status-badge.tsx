import { Badge } from "@/components/ui/badge";
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from "../visit.constants";
import type { VisitStatus } from "../visit.dto";

type VisitStatusBadgeProps = {
  status: VisitStatus;
};

export const VisitStatusBadge = ({ status }: VisitStatusBadgeProps) => {
  const variant = VISIT_STATUS_COLORS[status] || "default";
  const label = VISIT_STATUS_LABELS[status] || status;

  return <Badge variant={variant}>{label}</Badge>;
};
