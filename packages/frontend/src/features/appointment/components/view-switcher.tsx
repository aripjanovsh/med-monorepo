import { Button } from "@/components/ui/button";

import {
  APPOINTMENT_STATUS,
  type AppointmentStatus,
} from "../appointment.constants";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

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
      <ButtonGroup>
        <Button
          variant="outline"
          className={cn(
            view === "calendar" &&
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
          size="sm"
          onClick={() => onViewChange("calendar")}
        >
          Календарь
        </Button>
        <Button
          variant="outline"
          className={cn(
            view === "list" &&
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
          size="sm"
          onClick={() => onViewChange("list")}
        >
          Список
        </Button>
      </ButtonGroup>

      {/* Status Filters */}
      {/* <div className="flex flex-wrap items-center gap-2"> */}
      <ButtonGroup>
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant="outline"
            className={cn(
              selectedStatus === filter.value &&
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
            )}
            size="sm"
            onClick={() => onStatusChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </ButtonGroup>
      {/* </div> */}
    </div>
  );
};
