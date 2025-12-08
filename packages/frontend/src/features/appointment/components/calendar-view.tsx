import { useMemo, useEffect, useCallback } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  addMinutes,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  X,
  User,
  Stethoscope,
  CalendarOff,
  Palmtree,
  PartyPopper,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getWeekdayName } from "@/lib/date.utils";
import type { EmployeeAvailabilityDto } from "@/features/employee-availability";
import type { EmployeeLeaveDaysDto } from "@/features/employee-leave-days";
import type { Holiday } from "@/features/master-data/master-data.types";

import type { AppointmentResponseDto } from "../appointment.dto";
import {
  getPatientFullName,
  getEmployeeFullName,
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

type DayStatus = {
  isNonWorking: boolean;
  isLeave: boolean;
  isHoliday: boolean;
  leaveReason?: string;
  leaveTypeName?: string;
  leaveTypeColor?: string;
  holidayName?: string;
};

type CalendarViewProps = {
  appointments: AppointmentResponseDto[];
  currentWeekStart: Date;
  onAppointmentClick?: (appointment: AppointmentResponseDto) => void;
  showEmployee?: boolean;
  availabilities?: EmployeeAvailabilityDto[];
  leaveDays?: EmployeeLeaveDaysDto[];
  holidays?: Holiday[];
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
  showEmployee = false,
  availabilities = [],
  leaveDays = [],
  holidays = [],
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

  // Check if employee works on a specific day
  const getDayStatus = useCallback(
    (day: Date): DayStatus => {
      const weekdayName = getWeekdayName(day);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      // Check if it's a company holiday
      for (const holiday of holidays) {
        const holidayStart = startOfDay(parseISO(holiday.startsOn));
        const holidayEnd = endOfDay(parseISO(holiday.until));

        if (
          isWithinInterval(dayStart, {
            start: holidayStart,
            end: holidayEnd,
          }) ||
          isWithinInterval(dayEnd, { start: holidayStart, end: holidayEnd })
        ) {
          return {
            isNonWorking: false,
            isLeave: false,
            isHoliday: true,
            holidayName: holiday.name,
          };
        }
      }

      // Check if it's a leave day
      for (const leave of leaveDays) {
        const leaveStart = startOfDay(parseISO(leave.startsOn));
        const leaveEnd = endOfDay(parseISO(leave.until));

        if (
          isWithinInterval(dayStart, { start: leaveStart, end: leaveEnd }) ||
          isWithinInterval(dayEnd, { start: leaveStart, end: leaveEnd })
        ) {
          return {
            isNonWorking: false,
            isLeave: true,
            isHoliday: false,
            leaveReason: leave.note,
            leaveTypeName: leave.leaveType?.name,
            leaveTypeColor: leave.leaveType?.color,
          };
        }
      }

      // Check availability - if no active availability includes this day, it's non-working
      if (availabilities.length > 0) {
        const activeAvailability = availabilities.find((avail) => {
          if (!avail.isActive) return false;

          const startsOn = startOfDay(parseISO(avail.startsOn));
          const until = avail.until
            ? endOfDay(parseISO(avail.until))
            : new Date("2099-12-31");

          // Check if day is within availability period
          if (dayStart < startsOn || dayStart > until) return false;

          // Check if weekday is in repeatOn
          return avail.repeatOn.includes(weekdayName);
        });

        if (!activeAvailability) {
          return {
            isNonWorking: true,
            isLeave: false,
            isHoliday: false,
          };
        }
      }

      return {
        isNonWorking: false,
        isLeave: false,
        isHoliday: false,
      };
    },
    [availabilities, leaveDays, holidays]
  );

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
          <div className="grid grid-cols-[50px_repeat(7,minmax(150px,1fr))] gap-x-1">
            <div className="p-1" />
            {weekDays.map((day) => {
              const eventsCount =
                appointmentsByDay.get(format(day, "yyyy-MM-dd"))?.length || 0;
              const dayStatus = getDayStatus(day);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "rounded-t-lg p-3 min-w-[150px] border-b border-border",
                    dayStatus.isNonWorking &&
                      "bg-[repeating-linear-gradient(135deg,#eef2f7_0px,#eef2f7_12px,#dfe4ea_12px,#dfe4ea_24px)] dark:bg-[repeating-linear-gradient(135deg,#1f2937_0px,#1f2937_12px,#111827_12px,#111827_24px)] bg-fixed",
                    dayStatus.isLeave &&
                      "bg-[repeating-linear-gradient(135deg,#fff1e8_0px,#fff1e8_12px,#ffd7b8_12px,#ffd7b8_24px)] dark:bg-[repeating-linear-gradient(135deg,#3b2a1f_0px,#3b2a1f_12px,#2a1d14_12px,#2a1d14_24px)] bg-fixed",
                    dayStatus.isHoliday &&
                      "bg-[repeating-linear-gradient(135deg,#fce7f3_0px,#fce7f3_12px,#fbcfe8_12px,#fbcfe8_24px)] dark:bg-[repeating-linear-gradient(135deg,#4a1942_0px,#4a1942_12px,#3b1033_12px,#3b1033_24px)] bg-fixed",
                    !dayStatus.isNonWorking &&
                      !dayStatus.isLeave &&
                      !dayStatus.isHoliday &&
                      "bg-muted/50 dark:bg-card",
                    isToday(day) &&
                      !dayStatus.isNonWorking &&
                      !dayStatus.isLeave &&
                      !dayStatus.isHoliday &&
                      "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <div className={cn("text-base font-semibold font-gilroy")}>
                    {format(day, "d MMMM", { locale: ru })}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <div className={cn("text-xs text-muted-foreground")}>
                      {format(day, "EEEE", { locale: ru })}
                    </div>
                    {eventsCount > 0 &&
                      !dayStatus.isNonWorking &&
                      !dayStatus.isLeave &&
                      !dayStatus.isHoliday && (
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
                className="grid grid-cols-[50px_repeat(7,minmax(150px,1fr))] gap-x-1"
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
                  const dayStatus = getDayStatus(day);
                  const isFirstRow = timeSlot === TIME_SLOTS[0];

                  return (
                    <div
                      key={`${day.toString()}-${timeSlot}`}
                      className={cn(
                        "relative p-1 min-h-[70px] min-w-[150px]",
                        !dayStatus.isNonWorking &&
                          !dayStatus.isLeave &&
                          !dayStatus.isHoliday &&
                          "bg-muted/50 dark:bg-card",
                        isToday(day) &&
                          !dayStatus.isNonWorking &&
                          !dayStatus.isLeave &&
                          !dayStatus.isHoliday &&
                          "bg-blue-50 dark:bg-blue-900/20",

                        dayStatus.isNonWorking &&
                          "bg-[repeating-linear-gradient(135deg,#eef2f7_0px,#eef2f7_12px,#dfe4ea_12px,#dfe4ea_24px)] dark:bg-[repeating-linear-gradient(135deg,#1f2937_0px,#1f2937_12px,#111827_12px,#111827_24px)] bg-fixed",
                        dayStatus.isLeave &&
                          "bg-[repeating-linear-gradient(135deg,#fff1e8_0px,#fff1e8_12px,#ffd7b8_12px,#ffd7b8_24px)] dark:bg-[repeating-linear-gradient(135deg,#3b2a1f_0px,#3b2a1f_12px,#2a1d14_12px,#2a1d14_24px)] bg-fixed",
                        dayStatus.isHoliday &&
                          "bg-[repeating-linear-gradient(135deg,#fce7f3_0px,#fce7f3_12px,#fbcfe8_12px,#fbcfe8_24px)] dark:bg-[repeating-linear-gradient(135deg,#4a1942_0px,#4a1942_12px,#3b1033_12px,#3b1033_24px)] bg-fixed"
                      )}
                    >
                      {isFirstRow && dayStatus.isNonWorking && (
                        <div className="flex flex-col items-center justify-center h-full py-2 text-center">
                          <CalendarOff className="size-5 text-muted-foreground mb-2" />
                          <div className="text-sm font-semibold font-gilroy text-muted-foreground">
                            Нерабочий день
                          </div>
                        </div>
                      )}
                      {isFirstRow && dayStatus.isLeave && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[60px] text-center py-2">
                          <Palmtree className="size-5 text-muted-foreground mb-2" />
                          <div className="text-sm font-semibold font-gilroy text-muted-foreground">
                            {dayStatus.leaveTypeName || "Отсутствует"}
                          </div>
                        </div>
                      )}
                      {isFirstRow && dayStatus.isHoliday && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[60px] text-center py-2">
                          <PartyPopper className="size-5 text-pink-600 dark:text-pink-400 mb-2" />
                          <div className="text-sm font-semibold font-gilroy text-pink-600 dark:text-pink-400">
                            {dayStatus.holidayName || "Праздник"}
                          </div>
                        </div>
                      )}
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
                                    {showEmployee ? (
                                      <Stethoscope className="size-4" />
                                    ) : (
                                      <User className="size-4" />
                                    )}

                                    <div className="text-xs text-foreground font-medium truncate">
                                      {showEmployee ? (
                                        <>
                                          {getEmployeeFullName(
                                            appointment.employee
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          {getPatientFullName(
                                            appointment.patient
                                          )}
                                        </>
                                      )}
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
