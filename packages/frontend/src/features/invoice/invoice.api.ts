import { rootApi } from "@/store/api/root.api";
import type {
  InvoiceResponseDto,
  InvoicesListResponseDto,
  CreateInvoiceRequestDto,
  UpdateInvoiceRequestDto,
  FindAllInvoicesQueryDto,
  CreatePaymentRequestDto,
  AddPaymentResponseDto,
  PaymentResponseDto,
} from "./invoice.dto";
import { INVOICE_API_TAG } from "./invoice.constants";

export const invoiceApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get invoices list
    getInvoices: builder.query<
      InvoicesListResponseDto,
      FindAllInvoicesQueryDto
    >({
      query: (params) => ({
        url: "/api/v1/invoices",
        params,
      }),
      providesTags: [INVOICE_API_TAG],
    }),

    // Get single invoice
    getInvoice: builder.query<InvoiceResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/invoices/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: INVOICE_API_TAG, id }],
    }),

    // Create invoice
    createInvoice: builder.mutation<
      InvoiceResponseDto,
      CreateInvoiceRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/invoices",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [INVOICE_API_TAG],
    }),

    // Update invoice
    updateInvoice: builder.mutation<
      InvoiceResponseDto,
      UpdateInvoiceRequestDto & { id: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/invoices/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: INVOICE_API_TAG, id },
        INVOICE_API_TAG,
      ],
    }),

    // Delete invoice
    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: INVOICE_API_TAG, id },
        INVOICE_API_TAG,
      ],
    }),

    // Add payment to invoice (split payment support!)
    addPayment: builder.mutation<
      AddPaymentResponseDto,
      { invoiceId: string; data: CreatePaymentRequestDto }
    >({
      query: ({ invoiceId, data }) => ({
        url: `/api/v1/invoices/${invoiceId}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: INVOICE_API_TAG, id: invoiceId },
        INVOICE_API_TAG,
      ],
    }),

    // Get payments for invoice
    getInvoicePayments: builder.query<PaymentResponseDto[], string>({
      query: (invoiceId) => ({
        url: `/api/v1/invoices/${invoiceId}/payments`,
      }),
      providesTags: (result, error, invoiceId) => [
        { type: INVOICE_API_TAG, id: `${invoiceId}-payments` },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useAddPaymentMutation,
  useGetInvoicePaymentsQuery,
} = invoiceApi;
