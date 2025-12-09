import { memo, useCallback, useMemo } from "react";
import {
  format,
  addDays,
  startOfWeek,
  parseISO,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useGetAppointmentsQuery } from "../appointment.api";
import { useGetEmployeeAvailabilitiesQuery } from "@/features/employee-availability";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type TimeSlot = {
  time: string;
  isBooked: boolean;
  isPast: boolean;
  appointmentId?: string;
};

type DaySchedule = {
  date: Date;
  dateStr: string;
  dayName: string;
  isToday: boolean;
  isWorkingDay: boolean;
  workingHours?: { from: string; to: string };
  slots: TimeSlot[];
};

type DoctorAvailabilityInfoProps = {
  employeeId: string | undefined;
  selectedDate: string | undefined;
  selectedTime: string | undefined;
  onSlotSelect: (date: string, time: string) => void;
  duration: number;
};

type TimeSlotButtonProps = {
  slot: TimeSlot;
  isSelected: boolean;
  dateStr: string;
  onSelect: (date: string, time: string) => void;
};

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const DAY_NAMES_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// Convert time string (HH:mm) to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Check if two time intervals overlap: [start1, end1) and [start2, end2)
const intervalsOverlap = (
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean => {
  return start1 < end2 && start2 < end1;
};

// Memoized TimeSlotButton component
const TimeSlotButton = memo(
  ({ slot, isSelected, dateStr, onSelect }: TimeSlotButtonProps) => (
    <button
      type="button"
      disabled={slot.isBooked || slot.isPast}
      onClick={() => onSelect(dateStr, slot.time)}
      className={cn(
        "w-full px-1 py-1 text-[11px] rounded transition-colors",
        slot.isBooked || slot.isPast
          ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
          : isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
      )}
    >
      {slot.time}
    </button>
  )
);

TimeSlotButton.displayName = "TimeSlotButton";

// Generate time slots based on working hours and slot duration (in minutes)
const generateTimeSlots = (
  from: string,
  to: string,
  slotDuration: number = 30
): string[] => {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(from);
  const endMinutes = timeToMinutes(to);

  let currentMinutes = startMinutes;

  while (currentMinutes + slotDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(
      `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    );
    currentMinutes += slotDuration;
  }

  return slots;
};

export const DoctorAvailabilityInfo = ({
  employeeId,
  selectedDate,
  selectedTime,
  onSlotSelect,
  duration = 30,
}: DoctorAvailabilityInfoProps) => {
  // Calculate week based on selected date or today
  const weekStart = useMemo(() => {
    const baseDate = selectedDate ? parseISO(selectedDate) : new Date();
    return startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
  }, [selectedDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekEnd = weekDates[6];

  // Fetch employee availability
  const { data: availabilityData, isLoading: isLoadingAvailability } =
    useGetEmployeeAvailabilitiesQuery(
      { employeeId: employeeId || "", limit: 100 },
      { skip: !employeeId }
    );

  // Fetch appointments for the week
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useGetAppointmentsQuery(
      {
        employeeId: employeeId || "",
        scheduledFrom: weekStart.toISOString(),
        scheduledTo: addDays(weekEnd, 1).toISOString(),
        limit: 100,
      },
      { skip: !employeeId }
    );

  // Navigate weeks - memoized callback
  const navigateWeek = useCallback(
    (direction: "prev" | "next") => {
      const newDate = addDays(weekStart, direction === "next" ? 7 : -7);
      onSlotSelect(format(newDate, "yyyy-MM-dd"), "");
    },
    [weekStart, onSlotSelect]
  );

  // Calculate schedule for each day
  const weekSchedule = useMemo((): DaySchedule[] => {
    if (!employeeId) return [];

    const availabilities = availabilityData?.data || [];
    const appointments = appointmentsData?.data || [];
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return weekDates.map((date) => {
      const dayOfWeek = date.getDay();
      const dayKey = DAY_KEYS[dayOfWeek];
      const dateStr = format(date, "yyyy-MM-dd");

      // Find applicable availability for this day
      const applicableAvailability = availabilities.find((avail) => {
        const startsOn = parseISO(avail.startsOn);
        const until = avail.until ? parseISO(avail.until) : null;

        const isInDateRange = until
          ? isWithinInterval(date, { start: startsOn, end: until })
          : date >= startsOn;

        const isRepeatingDay = avail.repeatOn.includes(dayKey);

        return isInDateRange && isRepeatingDay && avail.isActive;
      });

      // Get appointments for this day
      const dayAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.scheduledAt);
        return (
          isSameDay(aptDate, date) &&
          apt.status !== "CANCELLED" &&
          apt.status !== "NO_SHOW"
        );
      });

      // Pre-compute appointment intervals for efficient overlap checking
      const appointmentIntervals = dayAppointments.map((apt) => {
        const aptTime = format(new Date(apt.scheduledAt), "HH:mm");
        const aptStartMinutes = timeToMinutes(aptTime);
        const aptDuration = apt.duration || 30; // Default to 30 min if not specified
        return {
          start: aptStartMinutes,
          end: aptStartMinutes + aptDuration,
          id: apt.id,
        };
      });

      const isWorkingDay = !!applicableAvailability;
      const workingHours = applicableAvailability
        ? {
            from: applicableAvailability.startTime,
            to: applicableAvailability.endTime,
          }
        : undefined;

      // Generate slots
      let slots: TimeSlot[] = [];
      if (workingHours) {
        const timeSlots = generateTimeSlots(
          workingHours.from,
          workingHours.to,
          duration
        );

        slots = timeSlots.map((time) => {
          const slotStartMinutes = timeToMinutes(time);
          const slotEndMinutes = slotStartMinutes + duration;

          // Check if any appointment overlaps with this slot
          const overlappingAppointment = appointmentIntervals.find((apt) =>
            intervalsOverlap(
              slotStartMinutes,
              slotEndMinutes,
              apt.start,
              apt.end
            )
          );

          // Check if slot is in the past
          const isPast =
            dateStr < todayStr ||
            (dateStr === todayStr && slotStartMinutes < currentMinutes);

          return {
            time,
            isBooked: !!overlappingAppointment,
            isPast,
            appointmentId: overlappingAppointment?.id,
          };
        });
      }

      return {
        date,
        dateStr,
        dayName: DAY_NAMES_SHORT[dayOfWeek],
        isToday: todayStr === dateStr,
        isWorkingDay,
        workingHours,
        slots,
      };
    });
  }, [weekDates, availabilityData, appointmentsData, employeeId, duration]);

  if (!employeeId) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">Выберите врача для просмотра расписания</p>
      </div>
    );
  }

  if (isLoadingAvailability || isLoadingAppointments) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Предыдущая неделя"
          onClick={() => navigateWeek("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(weekStart, "d MMM", { locale: ru })} -{" "}
          {format(weekEnd, "d MMM yyyy", { locale: ru })}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Следующая неделя"
          onClick={() => navigateWeek("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week schedule grid */}
      <ScrollArea className="h-[300px] rounded-lg border">
        <div className="grid grid-cols-7 divide-x">
          {weekSchedule.map((day) => (
            <div key={day.dateStr} className="min-h-full">
              {/* Day header */}
              <div
                className={cn(
                  "sticky top-0 z-10 p-2 text-center border-b bg-background min-h-[57px]",
                  day.isToday && "bg-primary/5"
                )}
              >
                <div className="text-xs text-muted-foreground">
                  {day.dayName}
                </div>
                <div
                  className={cn(
                    "text-sm font-semibold mx-auto rounded-full text-primary-foreground flex items-center justify-center size-6 mt-1",
                    day.isToday && "bg-primary"
                  )}
                >
                  {format(day.date, "d")}
                </div>
              </div>

              {/* Time slots */}
              <div className="p-1 space-y-1">
                {!day.isWorkingDay ? (
                  <div className="text-[10px] text-muted-foreground text-center py-4">
                    Выходной
                  </div>
                ) : day.slots.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground text-center py-4">
                    Нет слотов
                  </div>
                ) : (
                  day.slots.map((slot) => (
                    <TimeSlotButton
                      key={slot.time}
                      slot={slot}
                      isSelected={
                        day.dateStr === selectedDate &&
                        slot.time === selectedTime
                      }
                      dateStr={day.dateStr}
                      onSelect={onSlotSelect}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-50 border border-green-200 dark:bg-green-900/20" />
          <span>Свободно</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200 dark:bg-gray-800" />
          <span>Занято</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Выбрано</span>
        </div>
      </div>
    </div>
  );
};
