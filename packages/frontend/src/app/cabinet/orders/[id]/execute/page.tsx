"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/states";
import { ROUTES, url } from "@/constants/route.constants";

import {
  useGetServiceOrderQuery,
  useUpdateServiceOrderMutation,
  ServiceOrderExecutionCard,
} from "@/features/service-order";

export default function ExecuteServiceOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const router = useRouter();

  const { data: order, isLoading, error, refetch } = useGetServiceOrderQuery(orderId);
  const [updateServiceOrder, { isLoading: isUpdating }] = useUpdateServiceOrderMutation();

  const handleStartWork = useCallback(async () => {
    await updateServiceOrder({
      id: orderId,
      status: "IN_PROGRESS",
    }).unwrap();
  }, [orderId, updateServiceOrder]);

  const handleSaveDraft = useCallback(
    async (data: {
      resultText?: string;
      resultData?: Record<string, any>;
    }) => {
      await updateServiceOrder({
        id: orderId,
        ...data,
      }).unwrap();
    },
    [orderId, updateServiceOrder]
  );

  const handleComplete = useCallback(
    async (data: {
      resultText?: string;
      resultData?: Record<string, any>;
    }) => {
      await updateServiceOrder({
        id: orderId,
        status: "COMPLETED",
        ...data,
      }).unwrap();

      router.push(url(ROUTES.ORDER_DETAIL, { id: orderId }));
    },
    [orderId, updateServiceOrder, router]
  );

  const handleCancel = useCallback(async () => {
    await updateServiceOrder({
      id: orderId,
      status: "CANCELLED",
    }).unwrap();

    router.push(url(ROUTES.ORDERS));
  }, [orderId, updateServiceOrder, router]);

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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(url(ROUTES.ORDER_DETAIL, { id: orderId }))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Выполнение назначения</h1>
          <p className="text-muted-foreground">
            Прием в работу и ввод результатов
          </p>
        </div>
      </div>

      <ServiceOrderExecutionCard
        order={order}
        onStartWork={handleStartWork}
        onSaveDraft={handleSaveDraft}
        onComplete={handleComplete}
        onCancel={handleCancel}
        isLoading={isUpdating}
      />
    </div>
  );
}
