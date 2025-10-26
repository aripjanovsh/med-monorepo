import type { OrderStatus, PaymentStatus } from "./service-order.dto";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ORDERED: "Назначено",
  IN_PROGRESS: "В процессе",
  COMPLETED: "Выполнено",
  CANCELLED: "Отменено",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Не оплачено",
  PAID: "Оплачено",
  PARTIALLY_PAID: "Частично оплачено",
  REFUNDED: "Возвращено",
};

export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  ORDERED: "🔵",
  IN_PROGRESS: "⚙️",
  COMPLETED: "✅",
  CANCELLED: "🔴",
};

export const PAYMENT_STATUS_ICONS: Record<PaymentStatus, string> = {
  UNPAID: "❌",
  PAID: "💰",
  PARTIALLY_PAID: "🟠",
  REFUNDED: "↩️",
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  LAB: "Лабораторный",
  DIAGNOSTIC: "Диагностический",
  PROCEDURE: "Процедура",
  CONSULTATION: "Консультация",
};
