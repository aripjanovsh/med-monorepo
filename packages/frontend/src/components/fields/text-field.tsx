import type { ChangeEvent, ComponentProps, FC } from "react";
import { Field, FieldProps } from "@/components/fields/field";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type InputProps = Omit<ComponentProps<"input">, "onChange">;

export type TextFieldProps = FieldProps &
  InputProps & {
    onChange?: (value: string) => void;
  };

export const TextField: FC<TextFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,
  required,
  onChange,
  ...field
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
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
      <FormControl>
        <Input {...field} onChange={handleChange} />
      </FormControl>
    </Field>
  );
};
