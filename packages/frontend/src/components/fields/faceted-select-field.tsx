import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { ComponentType } from "react";
import { useTranslation } from "react-i18next";

export interface FacetedSelectOption {
  label: string;
  value: string;
  hint?: string | number;
  icon?: ComponentType<{ className?: string }>;
}

export interface FacetedSelectFieldProps {
  placeholder?: string;
  searchPlaceholder?: string;
  options: FacetedSelectOption[];
  value?: FacetedSelectOption["value"][];
  onChange?: (value: FacetedSelectOption["value"][]) => void;
}

export function FacetedSelectField({
  placeholder,
  searchPlaceholder,
  options,
  value = [],
  onChange,
}: FacetedSelectFieldProps) {
  const { t } = useTranslation();

  const valueLength = value.length;

  const handleChange = (newValue: FacetedSelectOption["value"][]) => {
    if (onChange) onChange(newValue);
  };

  const handleSelect = (optionValue: string) => {
    const updatedValues = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    handleChange(updatedValues);
  };

  const handleClear = () => {
    handleChange([]);
  };

  if (!options || !options.length) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed justify-start"
        >
          <PlusCircle />
          {placeholder || t("Выберите")}
          {valueLength > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {valueLength}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {valueLength > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {valueLength} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => value?.includes(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder || t("Поиск")} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value?.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50",
                      )}
                    >
                      <Checkbox checked={isSelected} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {option.label}
                    </span>
                    {option.hint && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {option.hint}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {valueLength > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
