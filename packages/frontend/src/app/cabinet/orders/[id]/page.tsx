"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Stethoscope, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileField } from "@/components/ui/profile-field";
import { LoadingState, ErrorState } from "@/components/states";
import { getPatientFullName } from "@/features/patients";
import { getEmployeeFullName } from "@/features/employees";
import { ROUTES, url } from "@/constants/route.constants";

import {
  useGetServiceOrderQuery,
  getOrderStatusVariant,
  getPaymentStatusVariant,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/features/service-order";


export default function ServiceOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const router = useRouter();

  const { data: order, isLoading, error, refetch } = useGetServiceOrderQuery(orderId);

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

  const patientName = getPatientFullName(order.patient);
  const doctorName = getEmployeeFullName(order.doctor);
  const performedByName = order.performedBy ? getEmployeeFullName(order.performedBy) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(url(ROUTES.ORDERS))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Назначение #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            Детальная информация о назначении
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Услуга</div>
              <div className="font-semibold text-lg">{order.service.name}</div>
              {order.service.code && (
                <div className="text-sm text-muted-foreground">
                  Код: {order.service.code}
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <ProfileField
                label="Тип услуги"
                value={
                  order.service.type
                    ? SERVICE_TYPE_LABELS[order.service.type] || order.service.type
                    : "—"
                }
              />

              <ProfileField
                label="Цена"
                value={order.service.price ? `${order.service.price} сум` : "—"}
              />
            </div>

            <Separator />

            <ProfileField label="Отделение" value={order.department?.name || "—"} />

            {order.protocolTemplate && (
              <>
                <Separator />
                <ProfileField
                  label="Шаблон протокола"
                  value={order.protocolTemplate.name}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Информация о персоналии */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Персоналии
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Пациент</div>
              <div className="font-semibold text-lg">{patientName}</div>
              {order.patient.patientId && (
                <div className="text-sm text-muted-foreground">
                  ID: {order.patient.patientId}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Назначил врач
              </div>
              <div className="font-medium">{doctorName}</div>
              {order.doctor.employeeId && (
                <div className="text-sm text-muted-foreground">
                  ID: {order.doctor.employeeId}
                </div>
              )}
            </div>

            {performedByName && (
              <>
                <Separator />
                <ProfileField label="Выполнил" value={performedByName} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Статусы и даты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Статусы и даты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Статус выполнения</div>
                <Badge variant={getOrderStatusVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Статус оплаты
                </div>
                <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </div>

            <Separator />

            <ProfileField
              label="Дата назначения"
              value={format(new Date(order.createdAt), "dd MMMM yyyy, HH:mm", {
                locale: ru,
              })}
            />

            {order.resultAt && (
              <>
                <Separator />
                <ProfileField
                  label="Дата выполнения"
                  value={format(new Date(order.resultAt), "dd MMMM yyyy, HH:mm", {
                    locale: ru,
                  })}
                />
              </>
            )}

            <Separator />

            <ProfileField
              label="Последнее обновление"
              value={format(new Date(order.updatedAt), "dd MMMM yyyy, HH:mm", {
                locale: ru,
              })}
            />
          </CardContent>
        </Card>

        {/* Результаты */}
        {(order.resultText || order.resultFileUrl) && (
          <Card>
            <CardHeader>
              <CardTitle>Результаты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.resultText && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Текст результата
                  </div>
                  <div className="rounded-md bg-muted p-4">
                    <p className="whitespace-pre-wrap">{order.resultText}</p>
                  </div>
                </div>
              )}

              {order.resultFileUrl && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Файл результата</div>
                  <Button asChild variant="outline">
                    <a href={order.resultFileUrl} target="_blank" rel="noopener noreferrer">
                      Открыть файл
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push(url(ROUTES.ORDERS))}>
          Вернуться к списку
        </Button>
        
        <div className="flex gap-2">
          {(order.status === "ORDERED" || order.status === "IN_PROGRESS") && (
            <Button onClick={() => router.push(`/cabinet/orders/${orderId}/execute`)}>
              {order.status === "ORDERED" ? "Принять в работу" : "Продолжить выполнение"}
            </Button>
          )}
          
          {order.status === "COMPLETED" && (order.resultText || order.resultData) && (
            <Button onClick={() => router.push(`/cabinet/orders/${orderId}/execute`)}>
              Редактировать результат
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
