import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";
import { ClassNameValue } from "tailwind-merge";

export interface FieldProps {
  required?: boolean;

  className?: ClassNameValue;
  label?: string;
  labelClassName?: ClassNameValue;
  labelHint?: ReactNode;
  labelHintClassName?: ClassNameValue;
  hint?: ReactNode;
  hintClassName?: ClassNameValue;
  children?: ReactNode;
}

export const Field: FC<FieldProps> = ({
  required,
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,
  children,
}) => {
  return (
    <FormItem className={cn(className)}>
      {label && (
        <FormLabel className={cn("gap-0", labelClassName)}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </FormLabel>
      )}
      {labelHint && (
        <FormDescription className={cn(labelHintClassName)}>
          {labelHint}
        </FormDescription>
      )}
      {children}
      {hint && (
        <FormDescription className={cn(hintClassName)}>{hint}</FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
};
