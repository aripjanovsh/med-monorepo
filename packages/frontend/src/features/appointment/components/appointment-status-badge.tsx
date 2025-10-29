import { Badge } from "@/components/ui/badge";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "../appointment.constants";
import type { AppointmentStatus } from "../appointment.constants";

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

export const AppointmentStatusBadge = ({
  status,
}: AppointmentStatusBadgeProps) => {
  const colorClass = APPOINTMENT_STATUS_COLORS[status] || "";
  const label = APPOINTMENT_STATUS_LABELS[status] || status;

  return <Badge className={colorClass}>{label}</Badge>;
};
