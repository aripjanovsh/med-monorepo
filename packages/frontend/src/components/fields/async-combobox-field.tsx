import { Field, FieldProps } from "@/components/fields/field";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { CheckIcon, PlusCircle, X } from "lucide-react";
import { FC, useEffect, useState, useRef } from "react";

export type AsyncOption = {
  label: React.ReactNode;
  displayLabel?: string; // Text to show in input field when selected
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
  disabled?: boolean;
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
  placeholder = "Поиск...",
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
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, debounceMs);
  const containerRef = useRef<HTMLDivElement>(null);

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
      setSearch("");
      setIsFocused(false);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (multiselect) {
      const newValue = selectedValues.filter((v) => v !== optionValue);
      (onChange as (value: string[] | undefined) => void)(
        newValue.length ? newValue : undefined
      );
    } else {
      (onChange as (value: string | undefined) => void)(undefined);
      setSearch("");
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadOptions(debouncedSearch);
    }
  }, [debouncedSearch, isFocused, loadOptions]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showResults = isFocused && (search.length > 0 || options.length > 0);

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

  // Display selected value in input when not focused
  const displayValue =
    !isFocused && !multiselect && selectedOptions.length > 0
      ? selectedOptions[0].displayLabel ||
        (typeof selectedOptions[0].label === "string"
          ? selectedOptions[0].label
          : "")
      : search;

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
      <div ref={containerRef} className="relative">
        {/* Selected badges for multiselect */}
        {multiselect && selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedOptions.map((option) => (
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
            ))}
          </div>
        )}

        <Command
          shouldFilter={false}
          className={cn(
            "border border-input rounded-md overflow-visible bg-transparent transition-[color,box-shadow]",
            isFocused && "border-ring ring-ring/50 ring-[3px]"
          )}
        >
          <div className="relative">
            <CommandInput
              placeholder={placeholder}
              value={displayValue}
              onValueChange={(val) => {
                if (disabled) return;
                setSearch(val);
                if (!multiselect && selectedOptions.length > 0) {
                  // Clear selection when user starts typing
                  (onChange as (value: string | undefined) => void)(undefined);
                }
              }}
              onFocus={() => {
                if (disabled) return;
                setIsFocused(true);
                if (!multiselect && selectedOptions.length > 0) {
                  setSearch("");
                }
              }}
              disabled={disabled}
              className="border-0"
            />
            {/* Clear button for single select */}
            {!multiselect &&
              selectedOptions.length > 0 &&
              !isFocused &&
              !disabled && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground p-1 rounded transition-colors"
                  onClick={(e) => handleRemove(selectedOptions[0].value, e)}
                >
                  <X size={14} />
                </button>
              )}
          </div>

          {showResults && (
            <CommandList className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md mt-1 max-h-[300px] overflow-auto">
              {loading && renderLoading()}
              {!loading &&
                options.length === 0 &&
                search.length > 0 &&
                renderEmpty()}
              {!loading && options.length > 0 && (
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      value={option.value}
                      key={option.value}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer"
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
          )}
        </Command>
      </div>
    </Field>
  );
};
