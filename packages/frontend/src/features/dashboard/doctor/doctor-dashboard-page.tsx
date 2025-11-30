"use client";

import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGetMeQuery } from "@/features/auth";
import { EmployeeSelect } from "@/features/employees";
import {
  useGetDoctorQueueQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
} from "@/features/visit/visit.api";
import { CompletedVisitsList } from "@/features/doctor/components/completed-visits-list";
import { StatsWidget } from "./widgets/stats-widget";
import { QueueWidget } from "./widgets/queue-widget";
import { CurrentPatientWidget } from "./widgets/current-patient-widget";

export const DoctorDashboardPage = () => {
  const { toast } = useToast();
  const { data: currentUser } = useGetMeQuery();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const { data, isLoading } = useGetDoctorQueueQuery(
    {
      employeeId: selectedEmployeeId,
    },
    {
      skip: !selectedEmployeeId,
    }
  );

  const [startVisit, { isLoading: isStarting }] = useStartVisitMutation();
  const [completeVisit, { isLoading: isCompleting }] =
    useCompleteVisitMutation();

  const handleEmployeeChange = useCallback((value: string) => {
    setSelectedEmployeeId(value);
  }, []);

  const handleStartVisit = useCallback(
    async (visitId: string) => {
      try {
        await startVisit({
          id: visitId,
          employeeId: selectedEmployeeId,
        }).unwrap();
        toast({
          title: "Успех",
          description: "Прием начат",
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось начать прием",
          variant: "destructive",
        });
      }
    },
    [startVisit, selectedEmployeeId, toast]
  );

  const handleCompleteVisit = useCallback(
    async (visitId: string) => {
      try {
        await completeVisit({
          id: visitId,
          employeeId: selectedEmployeeId,
        }).unwrap();
        toast({
          title: "Успех",
          description: "Прием завершен",
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось завершить прием",
          variant: "destructive",
        });
      }
    },
    [completeVisit, selectedEmployeeId, toast]
  );

  return (
    <div className="space-y-6">
      {/* Employee Selection */}
      <EmployeeSelect
        value={selectedEmployeeId}
        onChange={handleEmployeeChange}
        placeholder="Выберите врача"
      />

      {!selectedEmployeeId ? (
        <div className="rounded-lg border border-muted p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Выберите врача для отображения панели
          </p>
        </div>
      ) : (
        <>
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
              employeeId={selectedEmployeeId}
              onStartVisit={handleStartVisit}
              onCompleteVisit={handleCompleteVisit}
            />
            <QueueWidget
              employeeId={selectedEmployeeId}
              onStartVisit={handleStartVisit}
            />
          </div>

          {/* Completed Visits */}
          <CompletedVisitsList employeeId={selectedEmployeeId} />
        </>
      )}
    </div>
  );
};
