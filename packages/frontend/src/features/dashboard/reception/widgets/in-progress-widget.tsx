"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import {
  useGetVisitsQuery,
  VisitIncludeRelation,
  useCompleteVisitMutation,
} from "@/features/visit";
import { getPatientFullName } from "@/features/patients/patient.model";
import { formatDoctorShortName } from "@/features/visit/visit.model";
import { cn } from "@/lib/utils";
import { useMemo, useCallback } from "react";
import { differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 30000;

const getServiceTimeColor = (minutes: number) => {
  if (minutes < 15) return "text-green-600";
  if (minutes < 30) return "text-yellow-600";
  return "text-red-600";
};

export const InProgressWidget = () => {
  const router = useRouter();
  const { data, isLoading, error } = useGetVisitsQuery(
    {
      status: "IN_PROGRESS",
      sortBy: "startedAt",
      sortOrder: "asc",
      include: [VisitIncludeRelation.PATIENT, VisitIncludeRelation.EMPLOYEE],
      limit: 50,
    },
    {
      pollingInterval: REFRESH_INTERVAL_MS,
    }
  );

  const [completeVisit] = useCompleteVisitMutation();

  const handleCompleteVisit = useCallback(
    async (visitId: string, patientName: string) => {
      try {
        await completeVisit({
          id: visitId,
        }).unwrap();
        toast.success(`Приём пациента ${patientName} завершён`);
      } catch (error) {
        toast.error("Не удалось завершить приём");
      }
    },
    [completeVisit]
  );

  const handleViewVisit = useCallback(
    (visitId: string) => {
      router.push(`/cabinet/visits/${visitId}`);
    },
    [router]
  );

  const visits = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((visit) => ({
      visit,
      serviceTime: visit.startedAt
        ? differenceInMinutes(new Date(), new Date(visit.startedAt))
        : 0,
    }));
  }, [data?.data]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Ошибка загрузки приёмов
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {!visits || visits.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Нет активных приёмов
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] md:max-h-[600px] px-4">
            <div className="space-y-3">
              {visits.map((item) => (
                <div
                  key={item.visit.id}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleViewVisit(item.visit.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">
                            {getPatientFullName(item.visit.patient)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>
                          {formatDoctorShortName(item.visit.employee)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="default">На приёме</Badge>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            getServiceTimeColor(item.serviceTime)
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {item.serviceTime} мин
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewVisit(item.visit.id);
                            }}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Открыть визит
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteVisit(
                                item.visit.id,
                                getPatientFullName(item.visit.patient)
                              );
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Завершить приём
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
