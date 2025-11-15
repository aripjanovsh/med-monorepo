/**
 * Invoice model utilities for transforming between layers
 * Utility functions for invoice data manipulation
 */

import type {
  InvoiceResponseDto,
  InvoiceListItemDto,
  PaymentResponseDto,
} from "./invoice.dto";
import { getPatientFullName } from "@/features/patients";
import { getEmployeeShortName } from "@/features/employees";
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency.utils";

// =============================================
// Payment Utilities
// =============================================

export const getPaymentPaidByName = (payment: PaymentResponseDto): string => {
  return getEmployeeShortName(payment.paidBy);
};

// =============================================
// Invoice Status Utilities
// =============================================

export const getInvoiceRemainingAmount = (
  invoice: InvoiceResponseDto | InvoiceListItemDto,
): number => {
  return invoice.totalAmount - invoice.paidAmount;
};

export const isInvoiceFullyPaid = (
  invoice: InvoiceResponseDto | InvoiceListItemDto,
): boolean => {
  return invoice.status === "PAID";
};

export const isInvoiceUnpaid = (
  invoice: InvoiceResponseDto | InvoiceListItemDto,
): boolean => {
  return invoice.status === "UNPAID";
};

export const isInvoicePartiallyPaid = (
  invoice: InvoiceResponseDto | InvoiceListItemDto,
): boolean => {
  return invoice.status === "PARTIALLY_PAID";
};

export const canAddPayment = (
  invoice: InvoiceResponseDto | InvoiceListItemDto,
): boolean => {
  return invoice.status !== "PAID" && invoice.status !== "REFUNDED";
};

// =============================================
// Invoice Item Utilities
// =============================================

export const calculateItemTotal = (
  unitPrice: number,
  quantity: number,
  discount: number = 0,
): number => {
  return unitPrice * quantity - discount;
};

// =============================================
// Invoice Summary Utilities
// =============================================

export const getInvoiceSummary = (invoice: InvoiceResponseDto) => {
  const totalAmount = invoice.totalAmount;
  const paidAmount = invoice.paidAmount;
  const remainingAmount = totalAmount - paidAmount;
  const percentPaid = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return {
    totalAmount,
    paidAmount,
    remainingAmount,
    percentPaid,
    isFullyPaid: remainingAmount === 0,
    hasPayments: invoice.payments && invoice.payments.length > 0,
  };
};

// =============================================
// Invoice Display Utilities
// =============================================

export const getInvoiceDisplayTitle = (invoice: InvoiceResponseDto): string => {
  return `Счет ${invoice.invoiceNumber}`;
};

export const getInvoicePatientDisplay = (
  invoice: InvoiceResponseDto | InvoiceListItemDto,
): string => {
  return getPatientFullName(invoice.patient);
};

export const getInvoiceCreatedByDisplay = (
  invoice: InvoiceResponseDto,
): string => {
  return getEmployeeShortName(invoice.createdBy);
};
