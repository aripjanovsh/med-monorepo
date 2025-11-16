import { Button } from "@/components/ui/button";

import {
  APPOINTMENT_STATUS,
  type AppointmentStatus,
} from "../appointment.constants";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { OptionSwitcher } from "@/components/ui/option-switcher";

type ViewMode = "calendar" | "list";

type ViewSwitcherProps = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedStatus?: AppointmentStatus | "all";
  onStatusChange: (status: AppointmentStatus | "all") => void;
};

const STATUS_FILTERS = [
  { value: "all", label: "Все" },
  { value: APPOINTMENT_STATUS.SCHEDULED, label: "Запланированные" },
  { value: APPOINTMENT_STATUS.CONFIRMED, label: "Подтвержденные" },
  { value: APPOINTMENT_STATUS.CANCELLED, label: "Отмененные" },
  { value: APPOINTMENT_STATUS.COMPLETED, label: "Завершенные" },
] as const;

export const ViewSwitcher = ({
  view,
  onViewChange,
  selectedStatus = "all",
  onStatusChange,
}: ViewSwitcherProps) => {
  return (
    <div className="flex flex-wrap flex-row items-center gap-3">
      <OptionSwitcher
        options={[
          { label: "Календарь", value: "calendar" },
          { label: "Список", value: "list" },
        ]}
        value={view}
        onChange={onViewChange}
      />

      <OptionSwitcher
        options={STATUS_FILTERS as any}
        value={selectedStatus}
        onChange={onStatusChange}
      />
    </div>
  );
};
