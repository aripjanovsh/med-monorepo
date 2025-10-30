import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { IMaskInput } from "react-imask";
import IMask from "imask";
import { format, parse, isValid as isValidDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";

import { Field, type FieldProps } from "@/components/fields/field";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = FieldProps & {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  maxDate?: Date | null;
  minDate?: Date | null;
  valueFormat?: string;
  displayFormat?: string;
  disabled?: boolean;
};

const DEFAULT_VALUE_FORMAT = "yyyy-MM-dd";
const DEFAULT_DISPLAY_FORMAT = "dd.MM.yyyy";
const DEFAULT_PLACEHOLDER = "ДД.ММ.ГГГГ";

export const DatePickerField = ({
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
}: DatePickerFieldProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse value from backend format (yyyy-MM-dd) to Date
  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    try {
      const parsed = parse(value, valueFormat, new Date());
      return isValidDate(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value, valueFormat]);

  // Convert Date to display format (dd.MM.yyyy) for input
  const displayValue = useMemo(() => {
    if (!selectedDate) return "";
    try {
      return format(selectedDate, displayFormat);
    } catch {
      return "";
    }
  }, [selectedDate, displayFormat]);

  // Handle manual input changes
  const handleAccept = useCallback(
    (maskedValue: string) => {
      // Only process complete dates (10 chars: dd.MM.yyyy)
      if (maskedValue.length !== 10) {
        // Clear value if input is incomplete
        if (value && maskedValue.length === 0) {
          onChange?.(undefined);
        }
        return;
      }

      try {
        // Parse from display format to Date
        const parsedDate = parse(maskedValue, displayFormat, new Date());

        if (!isValidDate(parsedDate)) {
          return;
        }

        // Check min/max constraints
        if (minDate && parsedDate < minDate) {
          return;
        }
        if (maxDate && parsedDate > maxDate) {
          return;
        }

        // Convert to backend format and update
        const formattedValue = format(parsedDate, valueFormat);
        if (formattedValue !== value) {
          onChange?.(formattedValue);
        }
      } catch {
        // Invalid date format, ignore
      }
    },
    [onChange, value, valueFormat, displayFormat, minDate, maxDate]
  );

  // Handle calendar selection
  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        try {
          const formattedValue = format(date, valueFormat);
          onChange?.(formattedValue);
        } catch {
          // Invalid date, ignore
        }
      } else {
        onChange?.(undefined);
      }
      setIsOpen(false);
    },
    [onChange, valueFormat]
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
        <div className="relative">
          <FormControl>
            <IMaskInput
              mask="dd.MM.yyyy"
              blocks={{
                dd: {
                  mask: IMask.MaskedRange,
                  from: 1,
                  to: 31,
                  maxLength: 2,
                },
                MM: {
                  mask: IMask.MaskedRange,
                  from: 1,
                  to: 12,
                  maxLength: 2,
                },
                yyyy: {
                  mask: IMask.MaskedRange,
                  from: 1900,
                  to: 2100,
                  maxLength: 4,
                },
              }}
              value={displayValue}
              onAccept={handleAccept}
              placeholder={placeholder}
              disabled={disabled}
              unmask={false}
              lazy={false}
              autofix={true}
              overwrite={true}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
          </FormControl>

          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-sm opacity-50 hover:opacity-100 transition-opacity",
                disabled && "cursor-not-allowed opacity-30"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={disabledMatcher}
            defaultMonth={selectedDate}
            fromYear={minDate?.getFullYear() ?? 1900}
            toYear={maxDate?.getFullYear() ?? new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
};
