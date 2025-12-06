import { useMemo, useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DATE_PRESETS = [
  { label: "Сегодня", value: "today" },
  { label: "Вчера", value: "yesterday" },
  { label: "Эта неделя", value: "thisWeek" },
  { label: "Этот месяц", value: "thisMonth" },
  { label: "Прошлый месяц", value: "lastMonth" },
] as const;

type DatePreset = (typeof DATE_PRESETS)[number]["value"];

type DateRangeFilterProps = {
  dateFrom?: string;
  dateTo?: string;
  onChange: (dateFrom?: string, dateTo?: string) => void;
  placeholder?: string;
  className?: string;
};

const getPresetDateRange = (preset: DatePreset): { from: Date; to: Date } => {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    }
    case "thisWeek":
      return {
        from: startOfWeek(now, { locale: ru }),
        to: endOfWeek(now, { locale: ru }),
      };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
  }
};

const rangeToIso = (
  from?: Date,
  to?: Date
): { from?: string; to?: string } => ({
  from: from ? startOfDay(from).toISOString() : undefined,
  to: to ? endOfDay(to).toISOString() : undefined,
});

export const DateRangeFilter = ({
  dateFrom,
  dateTo,
  onChange,
  placeholder = "Дата",
  className,
}: DateRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const dateRange: DateRange | undefined = useMemo(() => {
    if (!dateFrom && !dateTo) return undefined;
    return {
      from: dateFrom ? new Date(dateFrom) : undefined,
      to: dateTo ? new Date(dateTo) : undefined,
    };
  }, [dateFrom, dateTo]);

  const handlePresetSelect = (preset: DatePreset) => {
    const range = getPresetDateRange(preset);
    const iso = rangeToIso(range.from, range.to);
    onChange(iso.from, iso.to);
    setIsOpen(false);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      onChange(undefined, undefined);
      return;
    }
    const iso = rangeToIso(range.from, range.to ?? range.from);
    onChange(iso.from, iso.to);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(undefined, undefined);
    setIsOpen(false);
  };

  const displayText = useMemo(() => {
    if (!dateFrom && !dateTo) return placeholder;
    if (dateFrom && dateTo) {
      if (dateFrom === dateTo) {
        return format(new Date(dateFrom), "dd.MM.yyyy", { locale: ru });
      }
      return `${format(new Date(dateFrom), "dd.MM", { locale: ru })} - ${format(new Date(dateTo), "dd.MM.yyyy", { locale: ru })}`;
    }
    if (dateFrom) {
      return `с ${format(new Date(dateFrom), "dd.MM.yyyy", { locale: ru })}`;
    }
    if (dateTo) {
      return `до ${format(new Date(dateTo), "dd.MM.yyyy", { locale: ru })}`;
    }
    return placeholder;
  }, [dateFrom, dateTo, placeholder]);

  const hasValue = Boolean(dateFrom || dateTo);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-10 border-dashed justify-start gap-2",
            hasValue && "border-solid",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>{displayText}</span>
          {hasValue && (
            <span
              role="button"
              tabIndex={0}
              className="ml-1 rounded-full hover:bg-muted p-0.5"
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
            >
              <X className="h-3 w-3 opacity-50 hover:opacity-100" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex flex-col border-r p-2 gap-1">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handlePresetSelect(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
            {hasValue && (
              <>
                <div className="border-t my-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-muted-foreground"
                  onClick={handleClear}
                >
                  Сбросить
                </Button>
              </>
            )}
          </div>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={1}
            locale={ru}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
