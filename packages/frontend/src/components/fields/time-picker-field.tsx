import type { ReactElement } from "react";
import { useCallback } from "react";
import { IMaskInput } from "react-imask";
import IMask from "imask";
import { cn } from "@/lib/utils";
import { Field, type FieldProps } from "@/components/fields/field";
import { FormControl } from "@/components/ui/form";

type TimePickerFieldProps = FieldProps & {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const DEFAULT_PLACEHOLDER = "ЧЧ:ММ";

export const TimePickerField = ({
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
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
}: TimePickerFieldProps): ReactElement => {
  // Handle manual input changes
  const handleAccept = useCallback(
    (maskedValue: string) => {
      // Only process complete times (5 chars: HH:MM)
      if (maskedValue.length !== 5) {
        // Clear value if input is incomplete
        if (value && maskedValue.length === 0) {
          onChange?.(undefined);
        }
        return;
      }

      // Validate time format
      const [hours, minutes] = maskedValue.split(":").map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        if (maskedValue !== value) {
          onChange?.(maskedValue);
        }
      }
    },
    [onChange, value]
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
      <FormControl>
        <IMaskInput
          mask="HH:MM"
          blocks={{
            HH: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 23,
              maxLength: 2,
            },
            MM: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 59,
              maxLength: 2,
            },
          }}
          value={value || ""}
          onAccept={handleAccept}
          placeholder={placeholder}
          disabled={disabled}
          unmask={false}
          lazy={false}
          autofix={true}
          overwrite={true}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </FormControl>
    </Field>
  );
};
