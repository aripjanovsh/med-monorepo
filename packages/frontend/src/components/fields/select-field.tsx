import { Field, FieldProps } from "@/components/fields/field";
import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FC, ReactNode } from "react";

interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps extends FieldProps {
  placeholder?: string;
  helperText?: ReactNode;
  options?: SelectOption[];
  onChange?: (value: string) => void;
  value?: string;
}

export const SelectField: FC<SelectFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,
  required,
  placeholder,
  options,
  onChange,
  value,
}) => {
  // Radix Select doesn't handle empty string well - use undefined for empty values
  const normalizedValue = value || undefined;

  const handleValueChange = (newValue: string) => {
    // Prevent setting empty string - treat it as undefined
    onChange?.(newValue || (undefined as unknown as string));
  };

  return (
    <Field
      {...{
        required,
        className,
        label,
        labelClassName,
        hint,
        hintClassName,
        labelHint,
        labelHintClassName,
      }}
    >
      <Select onValueChange={handleValueChange} value={normalizedValue}>
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
};
