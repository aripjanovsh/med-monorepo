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
  CommandSeparator,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, PlusCircle, X } from "lucide-react";
import { FC, useEffect, useState } from "react";

export type AsyncOption = {
  label: string;
  value: string;
};

interface BaseComboboxFieldProps extends FieldProps {
  searchPlaceholder?: string;
  placeholder?: string;
  empty?: string;
  loadOptions: (search: string) => Promise<void>;
  renderOption?: (option: AsyncOption) => React.ReactNode;
  debounceMs?: number;
  options: AsyncOption[];
  loading?: boolean;
  onCreate?: (value: string) => void;
  canCreate?: boolean;
  createButtonText?: string;
}

interface SingleComboboxFieldProps extends BaseComboboxFieldProps {
  multiselect?: false;
  value?: string;
  onChange: (value: string | undefined) => void;
}

interface MultiComboboxFieldProps extends BaseComboboxFieldProps {
  multiselect: true;
  value?: string[];
  onChange: (value: string[] | undefined) => void;
}

export type AsyncComboboxFieldProps =
  | SingleComboboxFieldProps
  | MultiComboboxFieldProps;

export const AsyncComboboxField: FC<AsyncComboboxFieldProps> = ({
  className,
  label,
  labelClassName,
  hint,
  hintClassName,
  labelHint,
  labelHintClassName,
  placeholder = "Выберите значение",
  searchPlaceholder = "Поиск...",
  empty = "Ничего не найдено",
  value,
  onChange,
  loadOptions,
  renderOption,
  debounceMs = 300,
  options,
  loading = false,
  multiselect = false,
  onCreate,
  canCreate = false,
  createButtonText = "Создать",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, debounceMs);

  const selectedValues = multiselect
    ? ((value as string[]) ?? [])
    : [value as string].filter(Boolean);
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const handleSelect = (option: AsyncOption) => {
    if (multiselect) {
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      (onChange as (value: string[] | undefined) => void)(
        newValue.length ? newValue : undefined
      );
    } else {
      (onChange as (value: string | undefined) => void)(
        option.value === value ? undefined : option.value
      );
      setOpen(false);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiselect) {
      const newValue = selectedValues.filter((v) => v !== optionValue);
      (onChange as (value: string[] | undefined) => void)(
        newValue.length ? newValue : undefined
      );
    }
  };

  useEffect(() => {
    if (open || debouncedSearch) {
      loadOptions(debouncedSearch);
    }
  }, [debouncedSearch, open, loadOptions]);

  const selectIsEmpty = selectedOptions.length === 0;

  const renderLoading = () => (
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-full bg-muted" />
      <Skeleton className="h-5 w-[80%] bg-muted" />
      <Skeleton className="h-5 w-[60%] bg-muted" />
    </div>
  );

  const renderEmpty = () => (
    <>
      <CommandEmpty className="py-2 px-4 text-sm text-muted-foreground">
        {empty}
      </CommandEmpty>
      {canCreate && search && (
        <>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              value={search}
              className="text-sm"
              onSelect={() => onCreate?.(search)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {createButtonText} "{search}"
            </CommandItem>
          </CommandGroup>
        </>
      )}
    </>
  );

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
                !selectIsEmpty && "py-1 pl-1 pr-7 h-auto hover:bg-background",
                selectIsEmpty && "text-muted-foreground"
              )}
            >
              {!selectIsEmpty ? (
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.map((option) =>
                    multiselect ? (
                      <Badge
                        key={option.value}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {option.label}
                        <button
                          type="button"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground p-0.5 rounded transition-colors"
                          onClick={(e) => handleRemove(option.value, e)}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ) : (
                      option.label
                    )
                  )}
                </div>
              ) : (
                placeholder
              )}
              <ChevronsUpDownIcon className="opacity-50 absolute top-2 right-4" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)]  max-h-[var(--radix-popover-content-available-height)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && renderLoading()}
              {!loading && options.length === 0 && renderEmpty()}
              {!loading && options.length > 0 && (
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      value={option.value}
                      key={option.value}
                      onSelect={() => handleSelect(option)}
                    >
                      {renderOption ? (
                        renderOption(option)
                      ) : (
                        <>
                          <CheckIcon
                            className={cn(
                              "mr-2",
                              selectedValues.includes(option.value)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Field>
  );
};
