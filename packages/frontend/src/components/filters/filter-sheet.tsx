"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { PaymentStatus } from "@/features/invoice/invoice.dto";
import { INVOICE_FILTER_FIELDS, InvoiceFilters } from "./types";
import { FilterField } from "./types";

interface FilterSheetProps {
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
  trigger?: React.ReactNode;
}

export function FilterSheet({
  filters,
  onFiltersChange,
  trigger,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<InvoiceFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Синхронизируем локальные фильтры с внешними
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const emptyFilters: InvoiceFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setIsOpen(false);
  };

  const updateFilter = (key: keyof InvoiceFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderFilterField = (field: FilterField) => {
    const value = localFilters[field.key];

    switch (field.type) {
      case "multiselect":
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <Select
              value=""
              onValueChange={(selectedValue) => {
                const currentValues = Array.isArray(value) ? value : [];
                const newValues = currentValues.includes(
                  selectedValue as PaymentStatus
                )
                  ? currentValues.filter((v) => v !== selectedValue)
                  : [...currentValues, selectedValue as PaymentStatus];
                updateFilter(field.key, newValues);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={`Выберите ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {Array.isArray(value) && value.includes(option.value) && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      {option.label}
                      {option.count && (
                        <Badge variant="secondary" className="ml-auto">
                          {option.count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {value.map((v) => {
                  const option = field.options?.find((opt) => opt.value === v);
                  return (
                    <Badge key={v} variant="secondary" className="gap-1">
                      {option?.label}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          const newValues = value.filter((val) => val !== v);
                          updateFilter(field.key, newValues);
                        }}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "daterange":
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateFrom ? (
                      format(localFilters.dateFrom, "dd.MM.yyyy", {
                        locale: ru,
                      })
                    ) : (
                      <span>От</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateFrom}
                    onSelect={(date) => updateFilter("dateFrom", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateTo ? (
                      format(localFilters.dateTo, "dd.MM.yyyy", { locale: ru })
                    ) : (
                      <span>До</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateTo}
                    onSelect={(date) => updateFilter("dateTo", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case "numberrange":
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="От"
                value={localFilters.minAmount || ""}
                onChange={(e) =>
                  updateFilter(
                    "minAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
              <Input
                type="number"
                placeholder="До"
                value={localFilters.maxAmount || ""}
                onChange={(e) =>
                  updateFilter(
                    "maxAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Фильтры</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {INVOICE_FILTER_FIELDS.map((field, index) => (
            <div key={field.key}>
              {renderFilterField(field)}
              {index < INVOICE_FILTER_FIELDS.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-2 pt-6 border-t">
          <Button variant="outline" onClick={handleResetFilters}>
            Сбросить все
          </Button>
          <Button onClick={handleApplyFilters}>Применить фильтры</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
