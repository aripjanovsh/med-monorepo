import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  parseISO,
  addMinutes,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AppointmentResponseDto } from "../appointment.dto";
import {
  getPatientFullName,
  formatAppointmentTime,
} from "../appointment.model";
import { APPOINTMENT_STATUS_COLORS } from "../appointment.constants";
import { ButtonGroup } from "@/components/ui/button-group";

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

type CalendarViewProps = {
  appointments: AppointmentResponseDto[];
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  onGoToToday: () => void;
  onAppointmentClick?: (appointment: AppointmentResponseDto) => void;
};

export const CalendarView = ({
  appointments,
  currentWeekStart,
  onWeekChange,
  onGoToToday,
  onAppointmentClick,
}: CalendarViewProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStart]);

  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, AppointmentResponseDto[]>();

    for (const appointment of appointments) {
      const date = parseISO(appointment.scheduledAt);
      const dayKey = format(date, "yyyy-MM-dd");

      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey)?.push(appointment);
    }

    return grouped;
  }, [appointments]);

  const getAppointmentsForDayAndTime = (day: Date, timeSlot: string) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const dayAppointments = appointmentsByDay.get(dayKey) || [];

    const [hours, minutes] = timeSlot.split(":").map(Number);
    const slotStart = new Date(day);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = addMinutes(slotStart, 60);

    return dayAppointments.filter((appointment) => {
      const appointmentTime = parseISO(appointment.scheduledAt);
      return appointmentTime >= slotStart && appointmentTime < slotEnd;
    });
  };

  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  const weekRange = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return `${format(start, "MMM d", { locale: ru })} - ${format(end, "MMM d, yyyy", { locale: ru })}`;
  }, [currentWeekStart]);

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            <ChevronRight />
          </Button>
        </ButtonGroup>
        <div className="text-sm font-medium">{weekRange}</div>
        <Button variant="outline" size="sm" onClick={onGoToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-background">
        {/* Days Header */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/50">
          <div className="p-3 text-xs font-medium text-muted-foreground" />
          {weekDays.map((day) => {
            const eventsCount =
              appointmentsByDay.get(format(day, "yyyy-MM-dd"))?.length || 0;
            return (
              <div
                key={day.toString()}
                className="p-3 text-center border-l first:border-l-0"
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {format(day, "EEE", { locale: ru })}
                </div>
                <div
                  className={cn(
                    "text-sm font-medium mt-1",
                    isToday(day) && "text-primary"
                  )}
                >
                  {format(day, "d")}
                </div>
                {eventsCount > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {eventsCount} событий
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {TIME_SLOTS.map((timeSlot) => (
            <div
              key={timeSlot}
              className="grid grid-cols-[80px_repeat(7,1fr)] border-b last:border-b-0"
            >
              {/* Time Label */}
              <div className="p-3 text-xs font-medium text-muted-foreground border-r">
                {timeSlot}
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDayAndTime(
                  day,
                  timeSlot
                );

                return (
                  <div
                    key={`${day.toString()}-${timeSlot}`}
                    className={cn(
                      "p-2 border-l first:border-l-0 min-h-[80px]",
                      isToday(day) && "bg-primary/5"
                    )}
                  >
                    <div className="space-y-1">
                      {dayAppointments.map((appointment) => (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => onAppointmentClick?.(appointment)}
                          className={cn(
                            "w-full text-left p-2 rounded text-xs transition-opacity hover:opacity-80",
                            APPOINTMENT_STATUS_COLORS[appointment.status]
                          )}
                        >
                          <div className="font-medium truncate">
                            {formatAppointmentTime(appointment.scheduledAt)}
                          </div>
                          <div className="truncate">
                            {getPatientFullName(appointment.patient)}
                          </div>
                          <div className="text-[10px] truncate opacity-80">
                            {appointment.service?.name || "Без услуги"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
