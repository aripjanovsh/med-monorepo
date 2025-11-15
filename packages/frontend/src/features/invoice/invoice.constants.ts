import type { PaymentStatus, PaymentMethod } from "./invoice.dto";

// Payment Status Constants
export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
} as const;

// Payment Method Constants
export const PAYMENT_METHOD = {
  CASH: "CASH",
  CARD: "CARD",
  ONLINE: "ONLINE",
  TRANSFER: "TRANSFER",
} as const;

// Payment Status Options (for UI)
export const PAYMENT_STATUS_OPTIONS = [
  { value: PAYMENT_STATUS.UNPAID, label: "Не оплачен", color: "red" },
  {
    value: PAYMENT_STATUS.PARTIALLY_PAID,
    label: "Частично оплачен",
    color: "orange",
  },
  { value: PAYMENT_STATUS.PAID, label: "Оплачен", color: "green" },
  { value: PAYMENT_STATUS.REFUNDED, label: "Возврат", color: "gray" },
] as const;

// Payment Method Options (for UI)
export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHOD.CASH, label: "Наличные", icon: "💵" },
  { value: PAYMENT_METHOD.CARD, label: "Карта", icon: "💳" },
  { value: PAYMENT_METHOD.ONLINE, label: "Онлайн", icon: "🌐" },
  { value: PAYMENT_METHOD.TRANSFER, label: "Перевод", icon: "🏦" },
] as const;

// Payment Status Map
export const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  UNPAID: { label: "Не оплачен", color: "red" },
  PARTIALLY_PAID: { label: "Частично оплачен", color: "orange" },
  PAID: { label: "Оплачен", color: "green" },
  REFUNDED: { label: "Возврат", color: "gray" },
};

// Payment Method Map
export const PAYMENT_METHOD_MAP: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  CASH: { label: "Наличные", icon: "💵" },
  CARD: { label: "Карта", icon: "💳" },
  ONLINE: { label: "Онлайн", icon: "🌐" },
  TRANSFER: { label: "Перевод", icon: "🏦" },
};

// API Tag
export const INVOICE_API_TAG = "Invoice" as const;

// Query Keys
export const INVOICE_QUERY_KEYS = {
  all: ["invoices"] as const,
  lists: () => [...INVOICE_QUERY_KEYS.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...INVOICE_QUERY_KEYS.lists(), params] as const,
  details: () => [...INVOICE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...INVOICE_QUERY_KEYS.details(), id] as const,
  payments: (id: string) =>
    [...INVOICE_QUERY_KEYS.detail(id), "payments"] as const,
} as const;
