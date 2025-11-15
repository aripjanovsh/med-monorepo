import { forwardRef, useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";
import { cn } from "@/lib/utils";

export type StepperInputProps = {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
} & Omit<React.ComponentProps<"input">, "onChange" | "value">;

export const StepperInput = forwardRef<HTMLInputElement, StepperInputProps>(
  (
    {
      value = 1,
      onChange,
      min = 1,
      max,
      step = 1,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    const handleIncrement = () => {
      const newValue = internalValue + step;
      if (max === undefined || newValue <= max) {
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    };

    const handleDecrement = () => {
      const newValue = internalValue - step;
      if (newValue >= min) {
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      const parsedValue = text.replace(/[^0-9]/g, "");
      const newValue = Number(parsedValue || min);

      // Apply min/max constraints
      let constrainedValue = newValue;
      if (constrainedValue < min) constrainedValue = min;
      if (max !== undefined && constrainedValue > max) constrainedValue = max;

      setInternalValue(constrainedValue);
      onChange?.(constrainedValue);
    };

    return (
      <InputGroup className={cn("w-auto", className)} data-disabled={disabled}>
        <InputGroupAddon align="inline-start">
          <InputGroupButton
            size="icon-xs"
            onClick={handleDecrement}
            disabled={disabled || internalValue <= min}
            aria-label="Decrease"
          >
            <Minus />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupInput
          ref={ref}
          type="text"
          inputMode="numeric"
          value={String(internalValue)}
          onChange={handleChange}
          disabled={disabled}
          className="w-16 text-center"
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && internalValue >= max)}
            aria-label="Increase"
          >
            <Plus />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  }
);

StepperInput.displayName = "StepperInput";
