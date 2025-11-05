/**
 * Invoice model utilities for transforming between layers
 * Utility functions for invoice data manipulation
 */

import type {
  InvoiceResponseDto,
  InvoiceListItemDto,
  PaymentResponseDto,
} from "./invoice.dto";

// =============================================
// Patient Name Utilities
// =============================================

type PatientInfo = {
  firstName: string;
  lastName: string;
  middleName?: string;
};

export const getInvoicePatientFullName = (patient: PatientInfo): string => {
  return [patient.lastName, patient.firstName, patient.middleName]
    .filter(Boolean)
    .join(" ");
};

export const getInvoicePatientShortName = (patient: PatientInfo): string => {
  return `${patient.lastName} ${patient.firstName[0]}.${patient.middleName ? ` ${patient.middleName[0]}.` : ""}`;
};

// =============================================
// Employee Name Utilities
// =============================================

type EmployeeInfo = {
  firstName: string;
  lastName: string;
  middleName?: string;
};

export const getEmployeeFullName = (employee: EmployeeInfo): string => {
  return [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
};

export const getEmployeeShortName = (employee: EmployeeInfo): string => {
  return `${employee.firstName} ${employee.lastName}`;
};

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
  invoice: InvoiceResponseDto | InvoiceListItemDto
): number => {
  return invoice.totalAmount - invoice.paidAmount;
};

export const isInvoiceFullyPaid = (
  invoice: InvoiceResponseDto | InvoiceListItemDto
): boolean => {
  return invoice.status === "PAID";
};

export const isInvoiceUnpaid = (
  invoice: InvoiceResponseDto | InvoiceListItemDto
): boolean => {
  return invoice.status === "UNPAID";
};

export const isInvoicePartiallyPaid = (
  invoice: InvoiceResponseDto | InvoiceListItemDto
): boolean => {
  return invoice.status === "PARTIALLY_PAID";
};

export const canAddPayment = (
  invoice: InvoiceResponseDto | InvoiceListItemDto
): boolean => {
  return invoice.status !== "PAID" && invoice.status !== "REFUNDED";
};

// =============================================
// Invoice Item Utilities
// =============================================

export const calculateItemTotal = (
  unitPrice: number,
  quantity: number,
  discount: number = 0
): number => {
  return unitPrice * quantity - discount;
};

// =============================================
// Amount Formatting Utilities
// =============================================

export const formatAmountWithCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} сум`;
};

export const formatAmountCompact = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}М сум`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}К сум`;
  }
  return formatAmountWithCurrency(amount);
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
  invoice: InvoiceResponseDto | InvoiceListItemDto
): string => {
  return getInvoicePatientFullName(invoice.patient);
};

export const getInvoiceCreatedByDisplay = (
  invoice: InvoiceResponseDto
): string => {
  return getEmployeeShortName(invoice.createdBy);
};
