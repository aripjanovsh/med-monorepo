// Types
export type {
  PaymentStatus,
  PaymentMethod,
  InvoiceResponseDto,
  InvoiceListItemDto,
  InvoicesListResponseDto,
  CreateInvoiceRequestDto,
  UpdateInvoiceRequestDto,
  CreatePaymentRequestDto,
  AddPaymentResponseDto,
  PaymentResponseDto,
  InvoiceItemResponseDto,
  FindAllInvoicesQueryDto,
} from "./invoice.dto";

// Schemas & Types
export type {
  InvoiceItemFormData,
  InvoiceFormData,
  PaymentFormData,
  InvoiceFilterData,
} from "./invoice.schema";

export {
  invoiceItemFormSchema,
  invoiceFormSchema,
  paymentFormSchema,
  createInvoiceRequestSchema,
  createPaymentRequestSchema,
  updateInvoiceRequestSchema,
  invoiceFilterSchema,
} from "./invoice.schema";

// Constants
export {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_MAP,
  PAYMENT_METHOD_MAP,
  INVOICE_API_TAG,
  INVOICE_QUERY_KEYS,
} from "./invoice.constants";

// API Hooks
export {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useAddPaymentMutation,
  useGetInvoicePaymentsQuery,
} from "./invoice.api";

// API instance (for advanced usage)
export { invoiceApi } from "./invoice.api";

// Model utilities
export {
  getInvoicePatientFullName,
  getInvoicePatientShortName,
  getEmployeeFullName,
  getEmployeeShortName,
  getPaymentPaidByName,
  getInvoiceRemainingAmount,
  isInvoiceFullyPaid,
  isInvoiceUnpaid,
  isInvoicePartiallyPaid,
  canAddPayment,
  calculateItemTotal,
  formatAmountWithCurrency,
  formatAmountCompact,
  getInvoiceSummary,
  getInvoiceDisplayTitle,
  getInvoicePatientDisplay,
  getInvoiceCreatedByDisplay,
} from "./invoice.model";

// Components
export { PaymentModal } from "./components/payment-modal";
export { CreateInvoiceSheet } from "./components/create-invoice-sheet";
export { CreateInvoiceWithPaymentSheet } from "./components/create-invoice-with-payment-sheet";
export { InvoiceOverview } from "./components/invoice-overview";
export {
  createInvoiceColumns,
  type InvoiceTableActions,
} from "./components/invoice-columns";
