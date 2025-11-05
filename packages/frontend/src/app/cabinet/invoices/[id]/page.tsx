"use client";

import { use } from "react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGetInvoiceQuery, InvoiceOverview } from "@/features/invoice";
import { ROUTES } from "@/constants/route.constants";
import { LayoutHeader } from "@/components/layouts/cabinet";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const { data: invoice, isLoading, error } = useGetInvoiceQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузка данных счета...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Счет не найден или произошла ошибка</p>
          <Button
            onClick={() => router.push(ROUTES.INVOICES)}
            variant="outline"
            className="mt-2"
          >
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/invoices" backTitle="Счета" />
      <InvoiceOverview invoice={invoice} />
    </div>
  );
}
