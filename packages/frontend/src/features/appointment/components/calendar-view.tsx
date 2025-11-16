import { useMemo, useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  addMinutes,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { AppointmentResponseDto } from "../appointment.dto";
import {
  getPatientFullName,
  formatAppointmentTime,
} from "../appointment.model";

const TIME_SLOTS = [
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
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
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "00:00",
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return <Check className="h-3 w-3 text-green-600 dark:text-green-400" />;
    case "SCHEDULED":
      return <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
    case "CANCELLED":
      return <X className="h-3 w-3 text-red-600 dark:text-red-400" />;
    default:
      return null;
  }
};

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "border-l-green-600 dark:border-l-green-400";
    case "SCHEDULED":
      return "border-l-amber-600 dark:border-l-amber-400";
    case "CANCELLED":
      return "border-l-red-600 dark:border-l-red-400";
    case "IN_PROGRESS":
      return "border-l-blue-600 dark:border-l-blue-400";
    case "COMPLETED":
      return "border-l-gray-600 dark:border-l-gray-400";
    default:
      return "border-l-gray-400 dark:border-l-gray-500";
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

export const Navigation = ({
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
      <div className="flex items-center gap-2 bg-muted p-[2px] pr-2 rounded-lg shadow-xs">
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={handlePreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            <ChevronRight />
          </Button>
        </ButtonGroup>
        <div className="text-xs font-medium">{weekRange}</div>
      </div>
      <Button variant="outline" size="sm" onClick={onGoToToday}>
        Сегодня
      </Button>
    </div>
  );
};

export const CalendarView = ({
  appointments,
  currentWeekStart,
  onAppointmentClick,
}: CalendarViewProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStart]);

  useEffect(() => {
    const scrollToCurrentTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentTimeSlot = `${String(currentHour).padStart(2, "0")}:00`;

      const element = document.getElementById(`time-slot-${currentTimeSlot}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    setTimeout(scrollToCurrentTime, 100);
  }, [currentWeekStart]);

  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, AppointmentResponseDto[]>();

    for (const appointment of appointments) {
      const dayKey = format(new Date(appointment.scheduledAt), "yyyy-MM-dd");

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
      const appointmentTime = new Date(appointment.scheduledAt);
      return appointmentTime >= slotStart && appointmentTime < slotEnd;
    });
  };

  return (
    <div className="">
      <ScrollArea className="w-full">
        <div className="min-w-fit">
          {/* Days Header */}
          <div className="grid grid-cols-[50px_repeat(7,minmax(150px,1fr))] gap-x-2">
            <div className="p-1" />
            {weekDays.map((day) => {
              const eventsCount =
                appointmentsByDay.get(format(day, "yyyy-MM-dd"))?.length || 0;

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "bg-muted/50 dark:bg-card rounded-t-lg p-3 min-w-[150px] border-b border-border",
                    isToday(day) && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <div className="text-base font-semibold font-gilroy text-foreground">
                    {format(day, "d MMMM", { locale: ru })}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {format(day, "EEEE", { locale: ru })}
                    </div>
                    {eventsCount > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {eventsCount}{" "}
                        {eventsCount === 1
                          ? "запись"
                          : eventsCount < 5
                            ? "записи"
                            : "записей"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          <ScrollArea className="h-[600px]">
            {TIME_SLOTS.map((timeSlot) => (
              <div
                id={`time-slot-${timeSlot}`}
                key={timeSlot}
                className="grid grid-cols-[50px_repeat(7,minmax(150px,1fr))] gap-x-2"
              >
                {/* Time Label */}
                <div className="p-1 text-xs font-medium text-muted-foreground flex items-start justify-end">
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
                        "bg-muted/50 dark:bg-card p-1 min-h-[70px] min-w-[150px]",
                        isToday(day) && "bg-blue-50 dark:bg-blue-900/20"
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
                                "w-full text-left p-2 rounded border-l-2 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow",
                                getStatusBorderColor(appointment.status)
                              )}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-foreground truncate">
                                    {formatAppointmentTime(
                                      appointment.scheduledAt
                                    )}
                                    {" - "}
                                    {formatAppointmentTime(
                                      addMinutes(
                                        new Date(appointment.scheduledAt),
                                        appointment.duration
                                      )
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
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
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
