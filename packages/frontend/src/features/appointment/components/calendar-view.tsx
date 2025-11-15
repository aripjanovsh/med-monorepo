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
import { ChevronLeft, ChevronRight, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AppointmentResponseDto } from "../appointment.dto";
import {
  getPatientFullName,
  formatAppointmentTime,
  getAppointmentDuration,
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return <Check className="h-3 w-3 text-green-600" />;
    case "SCHEDULED":
      return <Clock className="h-3 w-3 text-amber-600" />;
    case "CANCELLED":
      return <X className="h-3 w-3 text-red-600" />;
    default:
      return null;
  }
};

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "border-l-green-600";
    case "SCHEDULED":
      return "border-l-amber-600";
    case "CANCELLED":
      return "border-l-red-600";
    case "IN_PROGRESS":
      return "border-l-blue-600";
    case "COMPLETED":
      return "border-l-gray-600";
    default:
      return "border-l-gray-400";
  }
};

type NavigationProps = {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  onGoToToday: () => void;
};

type CalendarViewProps = {
  appointments: AppointmentResponseDto[];
  currentWeekStart: Date;
  onAppointmentClick?: (appointment: AppointmentResponseDto) => void;
};

const Navigation = ({
  currentWeekStart,
  onWeekChange,
  onGoToToday,
}: NavigationProps) => {
  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  const weekRange = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return `${format(start, "d MMM", { locale: ru })} - ${format(end, "d MMM yyyy", { locale: ru })}`;
  }, [currentWeekStart]);

  return (
    <div className="flex items-center gap-2">
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
        Сегодня
      </Button>
    </div>
  );
};

const CalendarViewBase = ({
  appointments,
  currentWeekStart,
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

  return (
    <div className="bg-gray-50 rounded-lg p-2">
      {/* Days Header */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-x-2">
        <div className="p-3" />
        {weekDays.map((day) => {
          const eventsCount =
            appointmentsByDay.get(format(day, "yyyy-MM-dd"))?.length || 0;
          return (
            <div key={day.toString()} className="bg-white rounded-t-lg p-3">
              <div className="text-base font-semibold text-foreground">
                {format(day, "d MMMM", { locale: ru })}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {format(day, "EEEE", { locale: ru })}
              </div>
              {eventsCount > 0 && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  {eventsCount}{" "}
                  {eventsCount === 1
                    ? "запись"
                    : eventsCount < 5
                      ? "записи"
                      : "записей"}
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
            className="grid grid-cols-[80px_repeat(7,1fr)] gap-x-2"
          >
            {/* Time Label */}
            <div className="p-3 text-xs font-medium text-muted-foreground flex items-start">
              {timeSlot}
            </div>

            {/* Day Cells */}
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDayAndTime(
                day,
                timeSlot,
              );

              return (
                <div
                  key={`${day.toString()}-${timeSlot}`}
                  className={cn(
                    "bg-white p-2 min-h-[70px]",
                    isToday(day) && "bg-blue-50",
                  )}
                >
                  <div className="space-y-2">
                    {dayAppointments.map((appointment) => {
                      return (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => onAppointmentClick?.(appointment)}
                          className={cn(
                            "w-full text-left p-2 rounded border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow",
                            getStatusBorderColor(appointment.status),
                          )}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-foreground truncate">
                                {formatAppointmentTime(appointment.scheduledAt)}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px]">
                                  {getPatientFullName(appointment.patient)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div className="text-xs text-foreground font-medium truncate">
                                  {getPatientFullName(appointment.patient)}
                                </div>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-1 truncate">
                                {appointment.service?.name || "Без услуги"}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {getStatusIcon(appointment.status)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarView = Object.assign(CalendarViewBase, {
  Navigation,
});
