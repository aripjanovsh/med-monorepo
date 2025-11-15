import { forwardRef, useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./input-group";

export type CurrencyInputProps = {
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  suffix?: string;
  max?: number;
} & Omit<React.ComponentProps<"input">, "onChange" | "value">;

const formatCurrency = (input: string | number | null = ""): string => {
  // Remove all non-numeric characters
  const numericValue = String(input).replace(/\D/g, "");

  // Check if the input is a single "0"
  if (numericValue === "0") {
    return "0";
  }

  // Remove any leading zeros for values greater than "0"
  const formattedValue = numericValue.replace(/^0+/, "");

  // Add thousands separator
  return formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "0",
      className,
      disabled,
      suffix = "сум",
      max,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>("");

    useEffect(() => {
      if (value !== undefined && value !== null) {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = inputValue.replace(/\D/g, "");

      // Parse value
      let parsedValue = numericValue ? Number.parseInt(numericValue, 10) : null;

      // Apply max limit if provided
      if (parsedValue !== null && max !== undefined && parsedValue > max) {
        parsedValue = max;
      }

      // Update display
      setDisplayValue(formatCurrency(parsedValue ?? numericValue));

      // Call onChange
      onChange?.(parsedValue);
    };

    return (
      <InputGroup className={className} data-disabled={disabled}>
        <InputGroupInput
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        {suffix && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{suffix}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
