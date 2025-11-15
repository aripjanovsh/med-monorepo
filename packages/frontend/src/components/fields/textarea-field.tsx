import { Field, FieldProps } from "@/components/fields/field";
import { FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ComponentProps, FC } from "react";

export interface TextareaFieldProps
  extends FieldProps,
    Omit<ComponentProps<"textarea">, "className"> {}

export const TextareaField: FC<TextareaFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,

  ...field
}) => {
  return (
    <Field
      {...{
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
        <Textarea className="resize-none" {...field} />
      </FormControl>
    </Field>
  );
};
