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
// Popover imports removed
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Check, Loader2, PlusCircle, X } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, debounceMs);

  const selectedValues = multiselect
    ? ((value as string[]) ?? [])
    : [value as string].filter(Boolean);
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  useEffect(() => {
    if (isOpen) {
      loadOptions(debouncedSearch);
    }
  }, [debouncedSearch, isOpen, loadOptions]);

  const handleSelect = (option: AsyncOption) => {
    if (multiselect) {
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      (onChange as (value: string[] | undefined) => void)(
        newValue.length ? newValue : undefined
      );
      // Keep open for multiselect, but clear search if desired?
      // For now, let's keep search as is or maybe focus back?
      inputRef.current?.focus();
    } else {
      (onChange as (value: string | undefined) => void)(
        option.value === value ? undefined : option.value
      );
      setSearch("");
      setOpen(false);
      // Hack to prevent immediate re-focus if we want to blur (optional)
      // but usually nice to keep focus or blur. Example blurs.
      // setTimeout(() => inputRef.current?.blur(), 0);
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    // Keep the options displayed when the user is typing
    if (!isOpen) {
      setOpen(true);
    }

    if (event.key === "Enter" && input.value !== "" && canCreate) {
      // Check if it's a create action if no option matches strictly?
      // Or let Command handle it? Command usually handles Enter for selection.
      // We'll let CommandItem's onSelect handle standard selection.
      // This block is for custom "Enter" actions if any.
    }

    if (event.key === "Escape") {
      input.blur();
      setOpen(false);
    }
  };

  const handleBlur = () => {
    // Small delay to allow click events on items to fire before closing
    setTimeout(() => {
      setOpen(false);
      if (!multiselect && selectedOptions.length > 0) {
        setSearch("");
      }
    }, 200);
  };

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
              className="text-sm cursor-pointer"
              onSelect={() => {
                onCreate?.(search);
                setOpen(false);
                setSearch("");
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {createButtonText} "{search}"
            </CommandItem>
          </CommandGroup>
        </>
      )}
    </>
  );

  // Display value logic
  // If single select and has value and NOT open/editing -> show label
  // BUT user wants input to be editable.
  // The input value should be `search`.
  // If we have a value selected, should we show it in input?
  // Usually:
  // - Multiselect: Badges outside, input empty (unless typing).
  // - Single select: Input shows Label. Focusing -> clears it (or selects all)?
  //   User's example: `inputValue` state.
  //   `value?.label || ""`
  //   We'll use `search`.
  //   If !isOpen and single value -> set search to label?

  useEffect(() => {
    if (!multiselect && selectedOptions.length === 1 && !isOpen) {
      const opt = selectedOptions[0];
      setSearch(opt.displayLabel || (opt.label as string));
    }
  }, [selectedOptions, multiselect, isOpen]);

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
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
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
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent"
      >
        <div className="relative">
          <div
            className={cn(
              "relative border border-input rounded-md bg-transparent transition-[color,box-shadow]",
              isOpen && "border-ring ring-ring/50 ring-[3px]"
            )}
          >
            <CommandInput
              ref={inputRef}
              placeholder={placeholder}
              value={search}
              onValueChange={(val) => {
                if (disabled) return;
                setSearch(val);
                setOpen(true);
                if (!multiselect && selectedOptions.length > 0 && !isOpen) {
                  // If they start typing over a selected value, we might want to clear it?
                  // Or just filter.
                  // User example clears on change if it was selected?
                  // Actually user example `onValueChange` sets `inputValue`.
                }
              }}
              onFocus={() => {
                if (disabled) return;
                setOpen(true);
              }}
              onBlur={handleBlur}
              disabled={disabled}
              className="border-0 pr-8"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {/* Clear button for single select */}
              {!multiselect &&
                selectedOptions.length > 0 &&
                !isOpen &&
                !disabled && (
                  <button
                    type="button"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground p-0.5 rounded transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(selectedOptions[0].value, e);
                      // Maybe focus input?
                      inputRef.current?.focus();
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
            </div>
          </div>

          {/* Dropdown Results */}
          {isOpen && (
            <div className="absolute top-full z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
              <CommandList>
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
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                      >
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
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
            </div>
          )}
        </div>
      </Command>
    </Field>
  );
};
