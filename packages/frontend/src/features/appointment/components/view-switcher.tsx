import { Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  APPOINTMENT_STATUS,
  type AppointmentStatus,
} from "../appointment.constants";

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
    <div className="flex flex-wrap items-center gap-3">
      {/* View Toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={view === "calendar" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("calendar")}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Календарь
        </Button>
        <Button
          variant={view === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("list")}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Список
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedStatus === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
