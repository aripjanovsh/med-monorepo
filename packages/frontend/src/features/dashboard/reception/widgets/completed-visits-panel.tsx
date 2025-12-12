"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Clock, Stethoscope } from "lucide-react";
import { useGetVisitsQuery } from "@/features/visit/visit.api";
import type { VisitResponseDto } from "@/features/visit/visit.dto";
import { getPatientFullName } from "@/features/patients/patient.model";
import {
  formatDoctorShortName,
  formatTimeAgo,
  getVisitUnpaidTotal,
  hasVisitUnpaidServices,
} from "@/features/visit/visit.model";
import { formatCurrency } from "@/lib/currency.utils";
import { useCallback, useMemo } from "react";
import { VisitIncludeRelation } from "@/features/visit/visit.dto";
import { ScrollArea } from "@/components/ui/scroll-area";
import { startOfToday, endOfToday } from "date-fns";
import { LoadingState } from "@/components/states";
import { EmptyState } from "@/components/states/empty-state";

type CompletedVisitsPanelProps = {
  onCreateInvoice: (visit: VisitResponseDto) => void;
};

export const CompletedVisitsPanel = ({
  onCreateInvoice,
}: CompletedVisitsPanelProps) => {
  // Get completed visits for today
  const { data: response, isLoading } = useGetVisitsQuery({
    status: "COMPLETED",
    sortBy: "completedAt",
    sortOrder: "desc",
    dateFrom: startOfToday().toISOString(),
    dateTo: endOfToday().toISOString(),
    include: [
      VisitIncludeRelation.PATIENT,
      VisitIncludeRelation.EMPLOYEE,
      VisitIncludeRelation.SERVICE_ORDERS,
    ],
    page: 1,
    limit: 20,
  });

  const completedVisits = useMemo(() => {
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
        <CardContent className="pt-4">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (!completedVisits || completedVisits.length === 0) {
    return (
      <Card>
        <CardContent className="pt-4">
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Завершенные приемы"
            description="Нет завершенных приемов за сегодня"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 px-4">
            {completedVisits.map((visit) => (
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
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" />
                        {formatDoctorShortName(visit.employee)}
                      </span>
                      {visit.completedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(visit.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasVisitUnpaidServices(visit) && (
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground">
                        К оплате
                      </div>
                      <div className="text-sm font-bold text-red-600">
                        {formatCurrency(getVisitUnpaidTotal(visit))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateInvoice(visit)}
                  >
                    Счёт
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
