import { Field, FieldProps } from "@/components/fields/field";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse, isValid as isValidDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { withMask } from "use-mask-input";
import { Matcher, SelectSingleEventHandler } from "react-day-picker";

interface DatePickerFieldProps extends FieldProps {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;

  maxDate?: Date | null;
  minDate?: Date | null;

  valueFormat?: string;
  displayFormat?: string;
}

export const DatePickerField: FC<DatePickerFieldProps> = ({
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
  placeholder = "ДД.ММ.ГГГГ",
  valueFormat = "yyyy-MM-dd",
  displayFormat = "dd.MM.yyyy",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse value from backend format (yyyy-MM-dd) to Date
  const selectedValue = value
    ? parse(value, valueFormat, new Date())
    : undefined;

  // Convert Date to display format (DD.MM.YYYY) for input
  const displayValue =
    selectedValue && isValidDate(selectedValue)
      ? format(selectedValue, displayFormat)
      : "";

  // Update input value when calendar selection changes
  useEffect(() => {
    if (inputRef.current && value) {
      try {
        const parsedDate = parse(value, valueFormat, new Date());
        if (isValidDate(parsedDate)) {
          inputRef.current.value = format(parsedDate, displayFormat);
        }
      } catch (error) {
        // Ignore
      }
    } else if (inputRef.current && !value) {
      inputRef.current.value = "";
    }
  }, [value, valueFormat, displayFormat]);

  // Handle manual input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Check if date is complete (10 chars: DD.MM.YYYY)
      if (inputValue.length !== 10) {
        return;
      }

      try {
        // Parse from display format to Date
        const parsedDate = parse(inputValue, displayFormat, new Date());

        if (isValidDate(parsedDate)) {
          // Check min/max constraints
          if (minDate && parsedDate < minDate) return;
          if (maxDate && parsedDate > maxDate) return;

          // Convert to backend format and update
          const formattedValue = format(parsedDate, valueFormat);
          onChange?.(formattedValue);
        }
      } catch (error) {
        // Invalid date, ignore
      }
    },
    [onChange, valueFormat, displayFormat, minDate, maxDate]
  );

  // Handle calendar selection
  const handleOnSelect: SelectSingleEventHandler = useCallback(
    (date) => {
      if (date) {
        onChange?.(format(date, valueFormat));
      } else {
        onChange?.(undefined);
      }
      setIsOpen(false);
    },
    [onChange, valueFormat]
  );

  // Disable dates in calendar
  const handleDisabled: Matcher = useCallback(
    (date: Date) => {
      const isBeforeMinDate = minDate ? date < minDate : false;
      const isAfterMaxDate = maxDate ? date > maxDate : false;

      return isBeforeMinDate || isAfterMaxDate;
    },
    [minDate, maxDate]
  );

  return (
    <Field
      {...{
        className: cn("flex flex-col", className),
        required,
        label,
        labelClassName,
        hint,
        hintClassName,
        labelHint,
        labelHintClassName,
      }}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative">
          <FormControl>
            <Input
              ref={(el) => {
                // Apply both refs
                (inputRef as any).current = el;
                const maskRef = withMask("datetime", {
                  inputFormat: "dd.MM.yyyy",
                  outputFormat: "yyyy-MM-dd",
                  placeholder: "_",
                  showMaskOnHover: false,
                }) as any;
                if (maskRef) maskRef(el);
              }}
              type="text"
              onChange={handleInputChange}
              placeholder={placeholder}
              className="pr-8"
              defaultValue={displayValue}
            />
          </FormControl>

          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedValue}
            onSelect={handleOnSelect}
            disabled={handleDisabled}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
};
