"use client";

import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FC, useMemo } from "react";
import { Field, FieldProps } from "./field";

type Option = {
  label: string;
  value: string;
};

export interface ListFieldProps extends Omit<FieldProps, "children"> {
  options: Option[];
  multiple?: boolean;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  maxHeight?: string;
  accordionClassName?: string;
  contentClassName?: string;
  optionClassName?: string;
  showSelectedCount?: boolean;
}

export const ListField: FC<ListFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,
  required,

  options = [],
  multiple = false,
  value,
  onChange,
  maxHeight = "200px",
  accordionClassName,
  contentClassName,
  optionClassName,
  showSelectedCount = true,
}) => {
  // Calculate selected count
  const selectedCount = useMemo(() => {
    if (!value) return 0;
    if (multiple && Array.isArray(value)) {
      return value.length;
    }
    if (!multiple && typeof value === "string" && value) {
      return 1;
    }
    return 0;
  }, [value, multiple]);

  // Handle selection change
  const handleSelectionChange = (optionValue: string, checked?: boolean) => {
    if (!onChange) return;

    if (multiple) {
      const currentSelection = Array.isArray(value) ? value : [];

      if (checked !== undefined) {
        // Checkbox mode
        let newSelection: string[];
        if (checked) {
          newSelection = [...currentSelection, optionValue];
        } else {
          newSelection = currentSelection.filter((v) => v !== optionValue);
        }
        onChange(newSelection);
      }
    } else {
      // Radio mode
      onChange(optionValue);
    }
  };

  // Check if option is selected
  const isOptionSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    if (!multiple && typeof value === "string") {
      return value === optionValue;
    }
    return false;
  };

  const accordionLabel = (
    <div className="flex items-center gap-2 w-full">
      <span className="font-medium">{label}</span>
      {showSelectedCount && (
        <Badge variant="secondary" className="text-xs">
          {selectedCount} Selected
        </Badge>
      )}
    </div>
  );

  return (
    <Field
      className={className}
      labelClassName={labelClassName}
      hint={hint}
      hintClassName={hintClassName}
      labelHint={labelHint}
      labelHintClassName={labelHintClassName}
      required={required}
    >
      <Accordion
        type="single"
        collapsible
        className={cn("border rounded-lg", accordionClassName)}
        defaultValue="list-content"
      >
        <AccordionItem value="list-content" className="border-b-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline border-b rounded-none">
            {accordionLabel}
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <ScrollArea className="w-full p-0" style={{ maxHeight }}>
              <div className={cn("space-y-3", contentClassName)}>
                {multiple ? (
                  // Checkbox mode for multiple selection
                  <div>
                    {options.map((option, index) => (
                      <FormItem
                        key={option.value}
                        className={cn(
                          "flex items-center space-x-3 space-y-0 py-3 border-b px-4",
                          index === options.length - 1
                            ? "border-b-0"
                            : "border-b",
                          optionClassName,
                        )}
                      >
                        <FormControl>
                          <Checkbox
                            checked={isOptionSelected(option.value)}
                            onCheckedChange={(checked) =>
                              handleSelectionChange(option.value, !!checked)
                            }
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-sm leading-relaxed flex-1">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                ) : (
                  // Radio mode for single selection
                  <FormControl>
                    <RadioGroup
                      value={typeof value === "string" ? value : ""}
                      onValueChange={(newValue) =>
                        handleSelectionChange(newValue)
                      }
                      className="space-y-3"
                    >
                      {options.map((option) => (
                        <FormItem
                          key={option.value}
                          className={cn(
                            "flex items-center space-x-3 space-y-0 py-2",
                            optionClassName,
                          )}
                        >
                          <FormControl>
                            <RadioGroupItem value={option.value} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-sm leading-relaxed flex-1">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Field>
  );
};
