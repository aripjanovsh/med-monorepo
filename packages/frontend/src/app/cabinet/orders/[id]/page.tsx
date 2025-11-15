"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { differenceInMinutes } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileField } from "@/components/ui/profile-field";
import { getPatientFullName } from "@/features/patients";
import { getEmployeeFullName } from "@/features/employees";
import { formatCurrency } from "@/lib/currency.utils";
import { ROUTES, url } from "@/constants/route.constants";

import {
  useGetServiceOrderQuery,
  SERVICE_TYPE_LABELS,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/features/service-order";
import { formatDate } from "@/lib/date.utils";

export default function ServiceOrderOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const router = useRouter();

  const { data: order } = useGetServiceOrderQuery(orderId);

  if (!order) return null;

  const patientName = getPatientFullName(order.patient);
  const doctorName = getEmployeeFullName(order.doctor);
  const performedByName = order.performedBy
    ? getEmployeeFullName(order.performedBy)
    : null;

  // Calculate execution time
  const executionTime =
    order.startedAt && order.finishedAt
      ? differenceInMinutes(
          new Date(order.finishedAt),
          new Date(order.startedAt),
        )
      : null;

  return (
    <div className="space-y-4">
      {/* Meta info row */}
      <div className="text-xs text-muted-foreground">
        <span className="mr-4">
          Дата создания: {formatDate(order.createdAt, "dd.MM.yyyy HH:mm")}
        </span>
        <span className="mr-4">
          Последнее обновление:{" "}
          {formatDate(order.updatedAt, "dd.MM.yyyy HH:mm")}
        </span>
      </div>
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfileField label="Услуга" value={order.service.name} />
            <ProfileField
              label="Код услуги"
              value={order.service.code || "—"}
            />
            <ProfileField
              label="Тип услуги"
              value={
                order.service.type
                  ? SERVICE_TYPE_LABELS[order.service.type] ||
                    order.service.type
                  : "—"
              }
            />
            <ProfileField
              label="Цена"
              value={
                order.service.price ? formatCurrency(order.service.price) : "—"
              }
            />
            <ProfileField
              label="Отделение"
              value={order.department?.name || "—"}
            />
            <ProfileField
              label="Шаблон протокола"
              value={order.protocolTemplate?.name || "—"}
            />
            {order.visitId && (
              <ProfileField
                label="ID визита"
                value={
                  <Button
                    variant="link"
                    className="h-auto p-0 text-blue-600 font-medium"
                    onClick={() =>
                      router.push(
                        url(ROUTES.VISIT_DETAIL, { id: order.visitId! }),
                      )
                    }
                  >
                    #{order.visitId.slice(0, 8)}
                  </Button>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Персоналии */}
      <Card>
        <CardHeader>
          <CardTitle>Персоналии</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfileField label="Пациент" value={patientName} />
            <ProfileField
              label="ID пациента"
              value={order.patient.patientId || "—"}
            />
            <ProfileField label="Назначил врач" value={doctorName} />
            <ProfileField
              label="ID врача"
              value={order.doctor.employeeId || "—"}
            />
            {performedByName && (
              <ProfileField label="Выполнил" value={performedByName} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Статусы и даты */}
      <Card>
        <CardHeader>
          <CardTitle>Статусы и даты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfileField
              label="Статус выполнения"
              value={<OrderStatusBadge status={order.status} />}
            />
            <ProfileField
              label="Статус оплаты"
              value={<PaymentStatusBadge status={order.paymentStatus} />}
            />
            <ProfileField
              label="Дата назначения"
              value={formatDate(order.createdAt, "dd MMMM yyyy, HH:mm")}
            />
            {order.resultAt && (
              <ProfileField
                label="Дата выполнения"
                value={formatDate(order.resultAt, "dd MMMM yyyy, HH:mm")}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* История выполнения */}
      {(order.startedAt || order.finishedAt) && (
        <Card>
          <CardHeader>
            <CardTitle>История выполнения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {order.startedAt && (
                <ProfileField
                  label="Начато выполнение"
                  value={formatDate(order.startedAt, "dd MMMM yyyy, HH:mm")}
                />
              )}
              {order.finishedAt && (
                <ProfileField
                  label="Завершено"
                  value={formatDate(order.finishedAt, "dd MMMM yyyy, HH:mm")}
                />
              )}
              {executionTime !== null && (
                <ProfileField
                  label="Время выполнения"
                  value={`${executionTime} мин`}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
