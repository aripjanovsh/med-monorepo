import type { ServiceOrderResponseDto } from "./service-order.dto";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_ICONS,
  PAYMENT_STATUS_ICONS,
} from "./service-order.constants";

export const getOrderStatusLabel = (status: string): string => {
  return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status;
};

export const getPaymentStatusLabel = (status: string): string => {
  return PAYMENT_STATUS_LABELS[status as keyof typeof PAYMENT_STATUS_LABELS] || status;
};

export const getOrderStatusIcon = (status: string): string => {
  return ORDER_STATUS_ICONS[status as keyof typeof ORDER_STATUS_ICONS] || "";
};

export const getPaymentStatusIcon = (status: string): string => {
  return PAYMENT_STATUS_ICONS[status as keyof typeof PAYMENT_STATUS_ICONS] || "";
};

export const getOrderStatusVariant = (
  status: string
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case "ORDERED":
      return "default";
    case "IN_PROGRESS":
      return "secondary";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

export const getPaymentStatusVariant = (
  status: string
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case "PAID":
      return "default";
    case "UNPAID":
      return "destructive";
    case "PARTIALLY_PAID":
      return "secondary";
    default:
      return "outline";
  }
};

export const canCancelOrder = (order: ServiceOrderResponseDto): boolean => {
  return (
    order.status !== "COMPLETED" &&
    order.status !== "CANCELLED" &&
    order.paymentStatus !== "PAID"
  );
};

export const canModifyOrder = (order: ServiceOrderResponseDto): boolean => {
  return order.paymentStatus !== "PAID";
};

export const isOrderCompleted = (order: ServiceOrderResponseDto): boolean => {
  return order.status === "COMPLETED";
};

export const isOrderPaid = (order: ServiceOrderResponseDto): boolean => {
  return order.paymentStatus === "PAID";
};

export const calculateTotal = (orders: ServiceOrderResponseDto[]): number => {
  return orders.reduce((sum, order) => sum + Number(order.service.price), 0);
};

export const calculateUnpaidTotal = (orders: ServiceOrderResponseDto[]): number => {
  return orders
    .filter((order) => order.paymentStatus === "UNPAID")
    .reduce((sum, order) => sum + Number(order.service.price), 0);
};
