"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useGetServiceOrderQuery,
  useUpdateServiceOrderMutation,
  ServiceOrderExecutionCard,
} from "@/features/service-order";

export default function ExecuteServiceOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = useGetServiceOrderQuery(orderId);
  const [updateServiceOrder, { isLoading: isUpdating }] = useUpdateServiceOrderMutation();

  const handleStartWork = async () => {
    await updateServiceOrder({
      id: orderId,
      status: "IN_PROGRESS",
    }).unwrap();
  };

  const handleSaveDraft = async (data: {
    resultText?: string;
    resultData?: Record<string, any>;
  }) => {
    await updateServiceOrder({
      id: orderId,
      ...data,
    }).unwrap();
  };

  const handleComplete = async (data: {
    resultText?: string;
    resultData?: Record<string, any>;
  }) => {
    await updateServiceOrder({
      id: orderId,
      status: "COMPLETED",
      ...data,
    }).unwrap();

    // Redirect to order detail page after completion
    router.push(`/cabinet/orders/${orderId}`);
  };

  const handleCancel = async () => {
    await updateServiceOrder({
      id: orderId,
      status: "CANCELLED",
    }).unwrap();

    // Redirect to orders list after cancellation
    router.push("/cabinet/orders");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-semibold">Назначение не найдено</h2>
        <Button onClick={() => router.push("/cabinet/orders")} className="mt-4">
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/cabinet/orders/${orderId}`)}
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
