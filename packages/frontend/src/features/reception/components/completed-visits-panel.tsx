"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Stethoscope,
} from "lucide-react";
import { useGetVisitsQuery } from "@/features/visit/visit.api";
import type { VisitResponseDto } from "@/features/visit/visit.dto";
import { getPatientFullName } from "@/features/patients/patient.model";
import { formatDoctorShortName, formatTimeAgo, getVisitUnpaidTotal, hasVisitUnpaidServices } from "@/features/visit/visit.model";
import { formatCurrency } from "@/lib/currency.utils";
import { useCallback, useMemo } from "react";
import { VisitIncludeRelation } from "@/features/visit/visit.dto";
import { ScrollArea } from "@/components/ui/scroll-area";

type CompletedVisitsPanelProps = {
  onCreateInvoice: (visit: VisitResponseDto) => void;
};

export const CompletedVisitsPanel = ({
  onCreateInvoice,
}: CompletedVisitsPanelProps) => {
  // Get completed visits with unpaid service orders
  const { data: response, isLoading } = useGetVisitsQuery({
    status: "COMPLETED",
    sortBy: "completedAt",
    sortOrder: "desc",
    include: [
      VisitIncludeRelation.PATIENT,
      VisitIncludeRelation.EMPLOYEE,
      VisitIncludeRelation.SERVICE_ORDERS,
    ],
    page: 1,
    limit: 20,
  });

  // Filter visits that have unpaid service orders
  const visitsWithUnpaidOrders = useMemo(() => {
    return response?.data ?? [];
  }, [response?.data]);

  const handleCreateInvoice = useCallback(
    (visit: VisitResponseDto) => {
      onCreateInvoice(visit);
    },
    [onCreateInvoice]
  );

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
      <CardContent className="p-0">
        {visitsWithUnpaidOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Завершенные приемы</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] md:max-h-[600px] px-4">
            <div className="space-y-2">
              {visitsWithUnpaidOrders.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {getPatientFullName(visit.patient)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>{formatDoctorShortName(visit.employee)}</span>
                        </div>
                        {visit.completedAt && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimeAgo(visit.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasVisitUnpaidServices(visit) && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            К оплате
                          </div>
                          <div className="text-sm font-bold text-red-600">
                            {formatCurrency(getVisitUnpaidTotal(visit))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleCreateInvoice(visit)}
                    >
                      Счёт
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
