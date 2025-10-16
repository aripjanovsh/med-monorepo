import { Field, FieldProps } from "@/components/fields/field";
import { FormControl } from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { FC } from "react";

export interface TextFieldProps
  extends FieldProps,
    Omit<InputProps, "required" | "children" | "className"> {}

export const TextField: FC<TextFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,
  required,
  ...field
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
      <FormControl>
        <Input {...field} />
      </FormControl>
    </Field>
  );
};
