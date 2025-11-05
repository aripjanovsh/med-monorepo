import * as yup from "yup";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "./invoice.constants";

// Invoice Item Form Schema
export const invoiceItemFormSchema = yup.object({
  serviceId: yup.string().required("Выберите услугу"),
  serviceOrderId: yup.string().optional(),
  quantity: yup.number().min(1, "Минимум 1").required("Укажите количество"),
  unitPrice: yup.number().min(0).optional(),
  discount: yup.number().min(0).default(0),
  description: yup.string().optional(),
});

// Invoice Form Schema (для UI)
export const invoiceFormSchema = yup.object({
  patientId: yup.string().required("Выберите пациента"),
  visitId: yup.string().optional(),
  items: yup
    .array(invoiceItemFormSchema)
    .min(1, "Добавьте хотя бы одну услугу")
    .required(),
  notes: yup.string().optional(),
  dueDate: yup.string().optional(), // ISO 8601
});

// Create Invoice Request Schema (для API)
export const createInvoiceRequestSchema = yup.object({
  patientId: yup.string().required(),
  visitId: yup.string().optional(),
  items: yup
    .array(
      yup.object({
        serviceId: yup.string().required(),
        serviceOrderId: yup.string().optional(),
        quantity: yup.number().min(1).required(),
        unitPrice: yup.number().min(0).optional(),
        discount: yup.number().min(0).default(0),
        description: yup.string().optional(),
      })
    )
    .min(1)
    .required(),
  notes: yup.string().optional(),
  dueDate: yup.string().optional(),
});

// Update Invoice Request Schema
export const updateInvoiceRequestSchema = yup.object({
  notes: yup.string().optional(),
  dueDate: yup.string().optional(),
});

// Payment Form Schema (для UI - split payment!)
export const paymentFormSchema = yup.object({
  amount: yup.number().min(0.01, "Минимум 0.01").required("Укажите сумму"),
  paymentMethod: yup
    .string()
    .oneOf(Object.values(PAYMENT_METHOD), "Выберите метод оплаты")
    .required("Выберите метод оплаты"),
  transactionId: yup.string().optional(),
  notes: yup.string().optional(),
  // UI-only fields для расчета сдачи
  receivedAmount: yup.number().min(0).optional(), // Получено от клиента (для CASH)
  change: yup.number().min(0).optional(), // Сдача (вычисляемое)
});

// Create Payment Request Schema (для API)
export const createPaymentRequestSchema = yup.object({
  amount: yup.number().min(0.01).required(),
  paymentMethod: yup
    .string()
    .oneOf(Object.values(PAYMENT_METHOD))
    .required(),
  transactionId: yup.string().optional(),
  notes: yup.string().optional(),
});

// Filter Schema для списка счетов
export const invoiceFilterSchema = yup.object({
  patientId: yup.string().optional(),
  visitId: yup.string().optional(),
  status: yup
    .string()
    .oneOf([...Object.values(PAYMENT_STATUS), ""])
    .optional(),
  dateFrom: yup.string().optional(), // ISO 8601
  dateTo: yup.string().optional(),
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
});

// Type inference
export type InvoiceItemFormData = yup.InferType<typeof invoiceItemFormSchema>;
export type InvoiceFormData = yup.InferType<typeof invoiceFormSchema>;
export type PaymentFormData = yup.InferType<typeof paymentFormSchema>;
export type InvoiceFilterData = yup.InferType<typeof invoiceFilterSchema>;
