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
