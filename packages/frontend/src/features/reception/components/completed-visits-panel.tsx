"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, User, Calendar, DollarSign } from "lucide-react";
import { useGetVisitsQuery } from "@/features/visit/visit.api";
import type { VisitResponseDto } from "@/features/visit/visit.dto";

type CompletedVisitsPanelProps = {
  organizationId: string;
  onCreateInvoice: (visit: VisitResponseDto) => void;
};

export const CompletedVisitsPanel = ({
  onCreateInvoice,
}: CompletedVisitsPanelProps) => {
  // Get completed visits with unpaid service orders
  const { data: response, isLoading } = useGetVisitsQuery({
    status: "COMPLETED",
    page: 1,
    limit: 50,
  });

  const formatPatientName = (patient: VisitResponseDto["patient"]) => {
    return [patient.lastName, patient.firstName, patient.middleName]
      .filter(Boolean)
      .join(" ");
  };

  const formatDoctorName = (employee: VisitResponseDto["employee"]) => {
    return `${employee.lastName} ${employee.firstName[0]}.`;
  };

  const getUnpaidTotal = (visit: VisitResponseDto) => {
    return (
      visit.serviceOrders
        ?.filter((so) => so.paymentStatus === "UNPAID")
        .reduce((sum, so) => sum + so.service.price, 0) ?? 0
    );
  };

  const hasUnpaidServices = (visit: VisitResponseDto) => {
    return (
      visit.serviceOrders?.some((so) => so.paymentStatus === "UNPAID") ?? false
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " сум";
  };

  // Filter visits that have unpaid service orders
  const visitsWithUnpaidOrders = response?.data ?? [];

  const data = visitsWithUnpaidOrders;

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
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Требуют оплаты
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Нет визитов, требующих оплаты
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-1 items-center gap-3">
                  {visit.queueNumber && (
                    <Badge
                      variant="outline"
                      className="h-8 w-8 justify-center rounded-full p-0 text-sm font-bold"
                    >
                      {visit.queueNumber}
                    </Badge>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatPatientName(visit.patient)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDoctorName(visit.employee)}</span>
                      {visit.finishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(visit.finishedAt).toLocaleTimeString(
                              "ru-RU",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasUnpaidServices(visit) && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          К оплате
                        </div>
                        <div className="text-base font-bold text-red-600">
                          {formatPrice(getUnpaidTotal(visit))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-3">
                  {true ? (
                    <Button size="sm" onClick={() => onCreateInvoice(visit)}>
                      <DollarSign className="mr-1 h-3.5 w-3.5" />
                      Счёт
                    </Button>
                  ) : (
                    <Badge variant="default" className="bg-green-500">
                      Оплачено
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
