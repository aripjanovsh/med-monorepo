import type { PaginatedResponseDto } from "@/types/api.types";

// Enums
export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "REFUNDED";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "TRANSFER";

// Invoice Item
export interface InvoiceItemResponseDto {
  id: string;
  serviceId: string;
  service: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  serviceOrderId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

// Payment
export interface PaymentResponseDto {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  paidBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  paidAt: string;
  createdAt: string;
}

// Invoice
export interface InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  visit?: {
    id: string;
    visitDate: string;
    status: string;
  };
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  notes?: string;
  dueDate?: string;
  items: InvoiceItemResponseDto[];
  payments: PaymentResponseDto[];
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Invoice List Item (минимальная версия для списков)
export interface InvoiceListItemDto {
  id: string;
  invoiceNumber: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  createdAt: string;
}

// Paginated Response
export type InvoicesListResponseDto = PaginatedResponseDto<InvoiceListItemDto>;

// Create Invoice Request
export interface CreateInvoiceItemRequestDto {
  serviceId: string;
  serviceOrderId?: string;
  quantity: number;
  unitPrice?: number;
  discount?: number;
  description?: string;
}

export interface CreateInvoiceRequestDto {
  patientId: string;
  visitId?: string;
  items: CreateInvoiceItemRequestDto[];
  notes?: string;
  dueDate?: string; // ISO 8601
}

// Update Invoice Request
export interface UpdateInvoiceRequestDto {
  notes?: string;
  dueDate?: string;
}

// Add Payment Request
export interface CreatePaymentRequestDto {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

// Add Payment Response
export interface AddPaymentResponseDto {
  payment: PaymentResponseDto;
  invoice: InvoiceResponseDto & {
    remainingAmount: number;
  };
}

// Query Params
export interface FindAllInvoicesQueryDto {
  patientId?: string;
  visitId?: string;
  status?: PaymentStatus;
  dateFrom?: string; // ISO 8601
  dateTo?: string; // ISO 8601
  search?: string; // Search by invoice number or patient name
  page?: number;
  limit?: number;
}
