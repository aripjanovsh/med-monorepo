"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, FileText, User, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetServiceOrdersQuery,
  OrderStatusBadge,
} from "@/features/service-order";

import type { ServiceOrderResponseDto } from "@/features/service-order/service-order.dto";

type UnpaidServicesPanelProps = Record<string, never>;

export const UnpaidServicesPanel = () => {
  const router = useRouter();

  const { data: response, isLoading } = useGetServiceOrdersQuery({
    paymentStatus: "UNPAID",
    status: "COMPLETED",
  });

  const handleCreateInvoice = (patientId: string, visitId: string) => {
    // Navigate to invoice creation page or open modal
    router.push(
      `/cabinet/reception/invoice/create?patientId=${patientId}&visitId=${visitId}`,
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " сум";
  };

  const formatPatientName = (patient: ServiceOrderResponseDto["patient"]) => {
    return [patient.lastName, patient.firstName, patient.middleName]
      .filter(Boolean)
      .join(" ");
  };

  const data = response?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Завершенные услуги (требуют оплаты)
          </CardTitle>
          <Badge variant="secondary">{data.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-2 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Нет завершенных услуг, ожидающих оплаты
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((service: ServiceOrderResponseDto) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatPatientName(service.patient)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{service.service.name}</span>
                    </div>
                    {service.finishedAt && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Завершено:{" "}
                        {new Date(service.finishedAt).toLocaleString("ru-RU")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={service.status as any} />
                    <div className="text-right">
                      <div className="text-sm font-medium text-muted-foreground">
                        Цена
                      </div>
                      <div className="text-lg font-bold">
                        {formatPrice(service.service.price)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleCreateInvoice(
                        service.patient.id,
                        service.visitId ?? "",
                      )
                    }
                    disabled={!service.visitId}
                  >
                    <DollarSign className="mr-1 h-4 w-4" />
                    Создать счёт
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
