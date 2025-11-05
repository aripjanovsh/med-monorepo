import { rootApi } from "@/store/api/root.api";

type UnpaidService = {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
  };
  visit: {
    id: string;
  };
  queueStatus?: string;
  status: string;
  finishedAt?: string;
  resultText?: string;
};

type UnpaidServicesResponse = {
  data: UnpaidService[];
  total: number;
};

export const unpaidServicesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnpaidServices: builder.query<
      UnpaidServicesResponse,
      { organizationId: string; date?: string }
    >({
      query: ({ organizationId, date }) => {
        const params = new URLSearchParams({ organizationId });
        if (date) params.append("date", date);
        return `/api/v1/service-orders?${params.toString()}&paymentStatus=UNPAID&status=COMPLETED`;
      },
      providesTags: ["ServiceOrder"],
    }),
  }),
});

export const { useGetUnpaidServicesQuery } = unpaidServicesApi;
