"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { LoadingState, ErrorState } from "@/components/states";
import { DetailNavigation } from "@/components/detail-navigation";
import { ROUTES, url } from "@/constants/route.constants";

import {
  useGetServiceOrderQuery,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/features/service-order";
import PageHeader from "@/components/layouts/page-header";
import { LayoutHeader, CabinetContent } from "@/components/layouts/cabinet";
import { Button } from "@/components/ui/button";

export default function ServiceOrderDetailLayout({
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

  const navItems = [
    { label: "Обзор", href: `/cabinet/orders/${id}`, value: "overview" },
    {
      label: "Результаты",
      href: `/cabinet/orders/${id}/results`,
      value: "results",
    },
  ];

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
    <>
      <LayoutHeader
        backHref="/cabinet/orders"
        backTitle="Назначения"
        right={
          <div className="flex gap-2">
            <div className="flex justify-end gap-2">
              {(order.status === "ORDERED" ||
                order.status === "IN_PROGRESS") && (
                <Button
                  onClick={() => router.push(`/cabinet/orders/${id}/execute`)}
                >
                  {order.status === "ORDERED"
                    ? "Принять в работу"
                    : "Продолжить выполнение"}
                </Button>
              )}

              {order.status === "COMPLETED" &&
                (order.resultText || order.resultData) && (
                  <Button
                    onClick={() => router.push(`/cabinet/orders/${id}/execute`)}
                  >
                    Редактировать результат
                  </Button>
                )}
            </div>
          </div>
        }
      />

      <CabinetContent className="space-y-6">
        <PageHeader
          title={order.service.name}
          titleSuffix={
            <div className="flex gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          }
          description={`Назначение #${order.id.slice(0, 8)}`}
        />

        {/* Navigation */}
        <DetailNavigation items={navItems} baseHref={`/cabinet/orders/${id}`} />

        {/* Content */}
        <div>{children}</div>
      </CabinetContent>
    </>
  );
}
