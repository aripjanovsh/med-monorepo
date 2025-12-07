"use client";

import { useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGetMeQuery } from "@/features/auth";
import {
  useGetDoctorQueueQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
} from "@/features/visit/visit.api";
import { CompletedVisitsList } from "@/features/doctor/components/completed-visits-list";
import { StatsWidget } from "@/features/dashboard/doctor/widgets/stats-widget";
import { QueueWidget } from "@/features/dashboard/doctor/widgets/queue-widget";
import { CurrentPatientWidget } from "@/features/dashboard/doctor/widgets/current-patient-widget";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";

export default function DashboardPageClient() {
  const { toast } = useToast();
  const { data: currentUser, isLoading: isUserLoading } = useGetMeQuery();

  const employeeId = currentUser?.employeeId ?? "";

  const { data, isLoading } = useGetDoctorQueueQuery(
    { employeeId },
    { skip: !employeeId }
  );

  const [startVisit] = useStartVisitMutation();
  const [completeVisit] = useCompleteVisitMutation();

  const handleStartVisit = useCallback(
    async (visitId: string) => {
      try {
        await startVisit({
          id: visitId,
          employeeId,
        }).unwrap();
        toast({
          title: "Успех",
          description: "Прием начат",
        });
      } catch {
        toast({
          title: "Ошибка",
          description: "Не удалось начать прием",
          variant: "destructive",
        });
      }
    },
    [startVisit, employeeId, toast]
  );

  const handleCompleteVisit = useCallback(
    async (visitId: string) => {
      try {
        await completeVisit({
          id: visitId,
          employeeId,
        }).unwrap();
        toast({
          title: "Успех",
          description: "Прием завершен",
        });
      } catch {
        toast({
          title: "Ошибка",
          description: "Не удалось завершить прием",
          variant: "destructive",
        });
      }
    },
    [completeVisit, employeeId, toast]
  );

  if (isUserLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="rounded-lg border border-muted p-6 text-center">
        <p className="text-sm text-muted-foreground">
          У вас нет привязанного профиля сотрудника
        </p>
      </div>
    );
  }

  return (
    <>
      <LayoutHeader title="Обзор" />
      <CabinetContent>
        <div className="space-y-6">
          {/* Stats */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : data ? (
            <StatsWidget
              stats={{
                totalPatients: data.stats.totalPatients,
                patientsInQueue: data.stats.waiting,
                completedToday: data.stats.completed,
                canceledToday: data.stats.canceled,
                avgWaitingTime: data.stats.avgWaitingTime,
                avgServiceTime: data.stats.avgServiceTime,
              }}
            />
          ) : null}

          {/* Current Patient & Queue */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CurrentPatientWidget
              employeeId={employeeId}
              onStartVisit={handleStartVisit}
              onCompleteVisit={handleCompleteVisit}
            />
            <QueueWidget
              employeeId={employeeId}
              onStartVisit={handleStartVisit}
            />
          </div>

          {/* Completed Visits */}
          <CompletedVisitsList employeeId={employeeId} />
        </div>
      </CabinetContent>
    </>
  );
}
