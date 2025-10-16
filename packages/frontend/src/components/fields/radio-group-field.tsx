import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { FC } from "react";
import { Field, FieldProps } from "./field";

type Option = {
  label: string;
  value: string;
};

interface RadioGroupFieldProps extends FieldProps {
  radioGroupClassName?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: Option[];
}

export const RadioGroupField: FC<RadioGroupFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,

  radioGroupClassName,
  onChange,
  value,
  options,
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
        <RadioGroup
          onValueChange={onChange}
          defaultValue={value}
          className={cn("flex flex-col gap-2", radioGroupClassName)}
        >
          {options?.map((option) => (
            <FormItem
              key={option.value}
              className="flex items-center space-x-1 space-y-0"
            >
              <FormControl>
                <RadioGroupItem value={option.value} />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                {option.label}
              </FormLabel>
            </FormItem>
          ))}
        </RadioGroup>
      </FormControl>
    </Field>
  );
};
