"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileField } from "@/components/ui/profile-field";
import { ROUTES, url } from "@/constants/route.constants";
import {
  getPatientFullName,
  calculatePatientAge,
  getGenderDisplay,
} from "@/features/patients";

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

  const { data: order } = useGetServiceOrderQuery(orderId);
  const [updateServiceOrder, { isLoading: isUpdating }] =
    useUpdateServiceOrderMutation();

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

  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о пациенте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfileField
              label="Пациент"
              value={getPatientFullName(order.patient)}
            />
            {order.patient.dateOfBirth && (
              <ProfileField
                label="Возраст"
                value={`${calculatePatientAge(order.patient.dateOfBirth)} лет`}
              />
            )}
            <ProfileField
              label="Пол"
              value={order.patient.gender ? getGenderDisplay(order.patient.gender) : "—"}
            />
            {order.patient.dateOfBirth && (
              <ProfileField
                label="Дата рождения"
                value={format(new Date(order.patient.dateOfBirth), "dd.MM.yyyy", {
                  locale: ru,
                })}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution Form */}
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
