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
      <Select onValueChange={onChange} value={value}>
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
