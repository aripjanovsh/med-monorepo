"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import type { InvoiceFilters } from "./types";
import {
  isFilterActive,
  getFilterDisplayValue,
  INVOICE_FILTER_FIELDS,
} from "./types";

interface ActiveFiltersProps {
  filters: InvoiceFilters;
  onFilterRemove: (key: keyof InvoiceFilters) => void;
  className?: string;
}

export function ActiveFilters({
  filters,
  onFilterRemove,
  className = "",
}: ActiveFiltersProps) {
  const activeFilters = INVOICE_FILTER_FIELDS.filter((field) =>
    isFilterActive(filters, field.key),
  );

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {activeFilters.map((field) => {
        const displayValue = getFilterDisplayValue(filters, field.key);
        if (!displayValue) return null;

        return (
          <Badge key={field.key} variant="secondary" className="gap-1 pr-1">
            <span className="text-xs font-medium text-muted-foreground">
              {field.label}:
            </span>
            <span className="max-w-[100px] truncate">{displayValue}</span>
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => onFilterRemove(field.key)}
            />
          </Badge>
        );
      })}
    </div>
  );
}
