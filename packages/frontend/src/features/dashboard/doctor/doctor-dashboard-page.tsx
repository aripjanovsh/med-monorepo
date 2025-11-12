"use client";

import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMeQuery } from "@/features/auth";
import { EmployeeSelect } from "@/features/employees";
import { useGetDoctorQueueQuery } from "@/features/doctor/api/doctor.api";
import { CompletedVisitsList } from "@/features/doctor/components/completed-visits-list";
import { StatsWidget } from "./widgets/stats-widget";
import { QueueWidget } from "./widgets/queue-widget";
import { CurrentPatientWidget } from "./widgets/current-patient-widget";

export const DoctorDashboardPage = () => {
  const { data: currentUser } = useGetMeQuery();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const organizationId = currentUser?.organizationId ?? "";

  const { data, isLoading } = useGetDoctorQueueQuery(
    {
      employeeId: selectedEmployeeId,
      organizationId,
    },
    {
      skip: !selectedEmployeeId || !organizationId,
    }
  );

  const handleEmployeeChange = useCallback((value: string) => {
    setSelectedEmployeeId(value);
  }, []);

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : data ? (
            <StatsWidget
              stats={{
                totalPatients: data.stats.waiting + data.stats.completed,
                patientsInQueue: data.stats.waiting,
                completedToday: data.stats.completed,
                canceledToday: 0,
              }}
            />
          ) : null}

          {/* Current Patient & Queue */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CurrentPatientWidget
              employeeId={selectedEmployeeId}
              organizationId={organizationId}
            />
            <QueueWidget
              employeeId={selectedEmployeeId}
              organizationId={organizationId}
            />
          </div>

          {/* Completed Visits */}
          <CompletedVisitsList
            employeeId={selectedEmployeeId}
            organizationId={organizationId}
          />
        </>
      )}
    </div>
  );
};
