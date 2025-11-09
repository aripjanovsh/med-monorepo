"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { LoadingState, ErrorState } from "@/components/states";
import { ROUTES, url } from "@/constants/route.constants";

import { useGetServiceOrderQuery } from "@/features/service-order";
import PageHeader from "@/components/layouts/page-header";
import { LayoutHeader } from "@/components/layouts/cabinet";

export default function ExecuteOrderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetServiceOrderQuery(id);

  if (isLoading) {
    return <LoadingState title="Загрузка назначения..." />;
  }

  if (error || !order) {
    return (
      <ErrorState
        title="Назначение не найдено"
        description="Не удалось загрузить информацию о назначении"
        onRetry={refetch}
        onBack={() => router.push(url(ROUTES.ORDERS))}
        backLabel="Вернуться к списку"
      />
    );
  }

  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref={url(ROUTES.ORDER_DETAIL, { id })}
        backTitle="Назад к назначению"
      />

      <PageHeader
        title="Выполнение назначения"
        description={order.service.name}
      />

      <div>{children}</div>
    </div>
  );
}
