"use client";

import { use } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useGetInvoiceQuery, InvoiceOverview } from "@/features/invoice";
import { ROUTES } from "@/constants/route.constants";
import { LayoutHeader } from "@/components/layouts/cabinet";
import { LoadingState, ErrorState } from "@/components/states";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const { data: invoice, isLoading, error, refetch } = useGetInvoiceQuery(id);

  if (isLoading) {
    return <LoadingState title="Загрузка данных счета..." />;
  }

  if (error || !invoice) {
    return (
      <ErrorState
        title="Счет не найден"
        description="Счет не найден или произошла ошибка при загрузке"
        onRetry={refetch}
        onBack={() => router.push(ROUTES.INVOICES)}
        backLabel="Вернуться к списку"
      />
    );
  }

  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/invoices" backTitle="Счета" />
      <InvoiceOverview invoice={invoice} />
    </div>
  );
}
