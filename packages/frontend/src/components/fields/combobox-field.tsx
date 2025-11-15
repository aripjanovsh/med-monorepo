import { Field, FieldProps } from "@/components/fields/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";
import { FC, ReactNode, useState } from "react";

export type Option = {
  label: string | ReactNode;
  value: string;
};

export interface BaseComboboxFieldProps extends FieldProps {
  searchPlaceholder?: string;
  placeholder?: string;
  empty?: string;
  options: Option[];
}

export interface SingleComboboxFieldProps extends BaseComboboxFieldProps {
  multiple?: false;
  value?: string;
  onChange: (value: string | undefined) => void;
}

export interface MultiComboboxFieldProps extends BaseComboboxFieldProps {
  multiple: true;
  value?: string[];
  onChange: (value: string[] | undefined) => void;
}

export type ComboboxFieldProps =
  | SingleComboboxFieldProps
  | MultiComboboxFieldProps;

export const ComboboxField: FC<ComboboxFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,

  placeholder = "Select",
  searchPlaceholder = "Search",
  empty = "Not found",
  value,
  onChange,
  options,
  multiple = false,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const selectedValues = multiple
    ? ((value as string[]) ?? [])
    : [value as string].filter(Boolean);
  const selectedOptions = options.filter((x) =>
    selectedValues.includes(x.value),
  );

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      (onChange as (value: string[] | undefined) => void)(
        newValue.length ? newValue : undefined,
      );
    } else {
      (onChange as (value: string | undefined) => void)(
        optionValue === selectedValues[0] ? undefined : optionValue,
      );
      setOpen(false);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const newValue = selectedValues.filter((v) => v !== optionValue);
      (onChange as (value: string[] | undefined) => void)(
        newValue.length ? newValue : undefined,
      );
    }
  };

  const renderOption = (option: Option) => {
    return (
      <Badge key={option.value} variant="outline" className="gap-1 pr-1">
        {option.label}
        <button
          type="button"
          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground p-0.5 rounded transition-colors"
          onClick={(e) => handleRemove(option.value, e)}
        >
          <X size={12} />
        </button>
      </Badge>
    );
  };

  const selectIsEmpty = selectedValues.length === 0;

  return (
    <Field
      {...{
        className: cn("flex flex-col", className),
        label,
        labelClassName,
        hint,
        hintClassName,
        labelHint,
        labelHintClassName,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "flex flex-wrap gap-[2px] w-full text-left items-center justify-start min-h-9 relative font-sans font-normal bg-background dark:bg-background",
                !selectIsEmpty &&
                  multiple &&
                  "py-1 pl-1 pr-7 h-auto hover:bg-background",
                selectIsEmpty && "text-muted-foreground",
                !multiple && "justify-between font-normal",
              )}
            >
              {multiple ? (
                <>
                  {!selectIsEmpty
                    ? selectedOptions.map(renderOption)
                    : placeholder}
                  <span className="flex-grow" />
                  <ChevronsUpDownIcon className="opacity-50 absolute top-2 right-4" />
                </>
              ) : (
                <>
                  {selectedOptions[0]?.label || placeholder}
                  <ChevronsUpDownIcon className="opacity-50" />
                </>
              )}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{empty}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    value={option.value}
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2",
                        selectedValues.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Field>
  );
};
