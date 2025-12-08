import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { format, parse, isValid as isValidDate } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import type { Matcher, SelectRangeEventHandler } from "react-day-picker";

import { Field, type FieldProps } from "@/components/fields/field";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangeValue = {
  from?: string;
  to?: string;
};

type DateRangeFieldProps = FieldProps & {
  value?: DateRangeValue;
  onChange?: (value?: DateRangeValue) => void;
  placeholder?: string;
  maxDate?: Date | null;
  minDate?: Date | null;
  valueFormat?: string;
  displayFormat?: string;
  disabled?: boolean;
  showPresets?: boolean;
};

const DATE_PRESETS = [
  { label: "Сегодня", value: "today" },
  { label: "Завтра", value: "nextDay" },
  { label: "Эта неделя", value: "thisWeek" },
  { label: "Этот месяц", value: "thisMonth" },
  { label: "Прошлый месяц", value: "lastMonth" },
] as const;

type DatePreset = (typeof DATE_PRESETS)[number]["value"];

const DEFAULT_VALUE_FORMAT = "yyyy-MM-dd";
const DEFAULT_DISPLAY_FORMAT = "dd.MM.yyyy";
const DEFAULT_PLACEHOLDER = "Выберите период";

const getPresetDateRange = (preset: DatePreset): { from: Date; to: Date } => {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: now, to: now };
    case "nextDay": {
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      return { from: nextDay, to: nextDay };
    }
    case "thisWeek": {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { from: startOfWeek, to: endOfWeek };
    }
    case "thisMonth": {
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    }
    case "lastMonth": {
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    }
  }
};

export const DateRangeField = ({
  className,
  required,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = DEFAULT_PLACEHOLDER,
  valueFormat = DEFAULT_VALUE_FORMAT,
  displayFormat = DEFAULT_DISPLAY_FORMAT,
  disabled = false,
  showPresets = true,
}: DateRangeFieldProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse value from backend format to Date objects
  const selectedRange = useMemo(() => {
    if (!value?.from) return undefined;

    try {
      const fromDate = parse(value.from, valueFormat, new Date());
      if (!isValidDate(fromDate)) return undefined;

      const toDate = value?.to
        ? parse(value.to, valueFormat, new Date())
        : undefined;
      if (value?.to && !isValidDate(toDate)) return undefined;

      return {
        from: fromDate,
        to: toDate,
      };
    } catch {
      return undefined;
    }
  }, [value, valueFormat]);

  // Convert Date range to display format for input
  const displayValue = useMemo(() => {
    if (!selectedRange?.from) return placeholder;

    try {
      const fromStr = format(selectedRange.from, displayFormat, { locale: ru });
      if (!selectedRange.to) return fromStr;

      if (
        format(selectedRange.from, displayFormat, { locale: ru }) ===
        format(selectedRange.to, displayFormat, { locale: ru })
      ) {
        return fromStr;
      }

      const toStr = format(selectedRange.to, displayFormat, { locale: ru });
      return `${fromStr} - ${toStr}`;
    } catch {
      return "";
    }
  }, [selectedRange, displayFormat, placeholder]);

  const hasValue = Boolean(selectedRange?.from);

  // Handle calendar selection
  const handleCalendarSelect: SelectRangeEventHandler = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (!range) {
        onChange?.(undefined);
        return;
      }

      try {
        const newValue: DateRangeValue = {};
        if (range.from) {
          newValue.from = format(range.from, valueFormat);
        }
        if (range.to) {
          newValue.to = format(range.to, valueFormat);
        }

        onChange?.(newValue);
      } catch {
        // Invalid date, ignore
      }
    },
    [onChange, valueFormat]
  );

  const handlePresetSelect = useCallback(
    (preset: DatePreset) => {
      const range = getPresetDateRange(preset);
      const newValue: DateRangeValue = {
        from: format(range.from, valueFormat),
        to: format(range.to, valueFormat),
      };
      onChange?.(newValue);
      setIsOpen(false);
    },
    [onChange, valueFormat]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onChange?.(undefined);
    },
    [onChange]
  );

  // Disable dates in calendar based on min/max constraints
  const disabledMatcher: Matcher = useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [minDate, maxDate]
  );

  return (
    <Field
      className={cn("flex flex-col", className)}
      required={required}
      label={label}
      labelClassName={labelClassName}
      hint={hint}
      hintClassName={hintClassName}
      labelHint={labelHint}
      labelHintClassName={labelHintClassName}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start gap-2 border-dashed",
              hasValue && "border-solid",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="truncate">{displayValue}</span>
            {hasValue && (
              <span
                role="button"
                tabIndex={0}
                className="ml-auto rounded-full hover:bg-muted p-0.5"
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
            {showPresets && (
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
                      onClick={() => onChange?.(undefined)}
                    >
                      Сбросить
                    </Button>
                  </>
                )}
              </div>
            )}
            <Calendar
              mode="range"
              captionLayout="dropdown"
              selected={selectedRange}
              onSelect={handleCalendarSelect}
              disabled={disabledMatcher}
              defaultMonth={selectedRange?.from}
              fromYear={minDate?.getFullYear() ?? 1900}
              toYear={maxDate?.getFullYear() ?? new Date().getFullYear() + 10}
              numberOfMonths={showPresets ? 1 : 2}
              locale={ru}
            />
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
};
