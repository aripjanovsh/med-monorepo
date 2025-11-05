import type { PaymentStatus } from "@/features/invoice/invoice.dto";

// Типы для фильтров
export interface InvoiceFilters {
  status?: PaymentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  patientId?: string;
  createdById?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterField {
  key: keyof InvoiceFilters;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange" | "number" | "numberrange";
  options?: FilterOption[];
  placeholder?: string;
}

// Конфигурация фильтров для invoices
export const INVOICE_FILTER_FIELDS: FilterField[] = [
  {
    key: "status",
    label: "Статус платежа",
    type: "multiselect",
    options: [
      { label: "Не оплачен", value: "UNPAID" },
      { label: "Частично оплачен", value: "PARTIALLY_PAID" },
      { label: "Оплачен", value: "PAID" },
      { label: "Возвращен", value: "REFUNDED" },
    ],
  },
  {
    key: "dateFrom",
    label: "Дата создания",
    type: "daterange",
    placeholder: "Выберите период",
  },
  {
    key: "minAmount",
    label: "Сумма",
    type: "numberrange",
    placeholder: "От и до",
  },
];

// Утилиты для работы с фильтрами
export const isFilterActive = (filters: InvoiceFilters, key: keyof InvoiceFilters): boolean => {
  const value = filters[key];
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && value !== "";
};

export const getActiveFiltersCount = (filters: InvoiceFilters): number => {
  return Object.keys(filters).filter(key => isFilterActive(filters, key as keyof InvoiceFilters)).length;
};

export const getFilterDisplayValue = (filters: InvoiceFilters, key: keyof InvoiceFilters): string => {
  const value = filters[key];
  const field = INVOICE_FILTER_FIELDS.find(f => f.key === key);

  if (!field || !value) return "";

  switch (field.type) {
    case "multiselect":
      if (Array.isArray(value)) {
        return value.map(v => field.options?.find(opt => opt.value === v)?.label).filter(Boolean).join(", ");
      }
      return "";
    case "daterange":
      if (key === "dateFrom" && filters.dateTo) {
        return `${filters.dateFrom?.toLocaleDateString()} - ${filters.dateTo?.toLocaleDateString()}`;
      }
      return value instanceof Date ? value.toLocaleDateString() : "";
    case "numberrange":
      if (key === "minAmount" && filters.maxAmount) {
        return `${filters.minAmount} - ${filters.maxAmount} сум`;
      }
      return value ? `${value} сум` : "";
    default:
      return String(value);
  }
};
