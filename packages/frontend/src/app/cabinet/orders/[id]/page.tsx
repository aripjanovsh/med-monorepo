"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Stethoscope, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useGetServiceOrderQuery,
  getPatientFullName,
  getDoctorFullName,
  getPerformedByFullName,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/features/service-order";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "ORDERED":
      return "default";
    case "IN_PROGRESS":
      return "secondary";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

const getPaymentVariant = (status: string) => {
  switch (status) {
    case "PAID":
      return "default";
    case "UNPAID":
      return "destructive";
    case "PARTIALLY_PAID":
      return "secondary";
    default:
      return "outline";
  }
};

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = useGetServiceOrderQuery(orderId);

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

  const patientName = getPatientFullName(order);
  const doctorName = getDoctorFullName(order);
  const performedByName = getPerformedByFullName(order);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/cabinet/orders")}
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
              <div>
                <div className="text-sm text-muted-foreground">Тип услуги</div>
                <div className="font-medium">
                  {order.service.type
                    ? SERVICE_TYPE_LABELS[order.service.type] || order.service.type
                    : "—"}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Цена</div>
                <div className="font-medium">
                  {order.service.price ? `${order.service.price} сум` : "—"}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground">Отделение</div>
              <div className="font-medium">{order.department?.name || "—"}</div>
            </div>

            {order.protocolTemplate && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground">Шаблон протокола</div>
                  <div className="font-medium">{order.protocolTemplate.name}</div>
                </div>
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
                <div>
                  <div className="text-sm text-muted-foreground">Выполнил</div>
                  <div className="font-medium">{performedByName}</div>
                </div>
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
                <Badge variant={getStatusVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Статус оплаты
                </div>
                <Badge variant={getPaymentVariant(order.paymentStatus)}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground">Дата назначения</div>
              <div className="font-medium">
                {format(new Date(order.createdAt), "dd MMMM yyyy, HH:mm", {
                  locale: ru,
                })}
              </div>
            </div>

            {order.resultAt && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground">Дата выполнения</div>
                  <div className="font-medium">
                    {format(new Date(order.resultAt), "dd MMMM yyyy, HH:mm", {
                      locale: ru,
                    })}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground">Последнее обновление</div>
              <div className="font-medium">
                {format(new Date(order.updatedAt), "dd MMMM yyyy, HH:mm", {
                  locale: ru,
                })}
              </div>
            </div>
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
        <Button variant="outline" onClick={() => router.push("/cabinet/orders")}>
          Вернуться к списку
        </Button>
        
        {(order.status === "ORDERED" || order.status === "IN_PROGRESS") && (
          <Button onClick={() => router.push(`/cabinet/orders/${orderId}/execute`)}>
            {order.status === "ORDERED" ? "Принять в работу" : "Продолжить выполнение"}
          </Button>
        )}
      </div>
    </div>
  );
}
