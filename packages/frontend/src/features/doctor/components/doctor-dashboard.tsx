"use client";

import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorQueuePanel } from "@/features/doctor/components/doctor-queue-panel";
import { DoctorStatsCard } from "@/features/doctor/components/doctor-stats-card";
import { CurrentPatientCard } from "@/features/doctor/components/current-patient-card";
import { CompletedVisitsList } from "@/features/doctor/components/completed-visits-list";
import { useGetDoctorQueueQuery } from "@/features/doctor/api/doctor.api";
import { EmployeeSelect } from "@/features/employees";
import { useGetMeQuery } from "@/features/auth";

export const DoctorDashboard = () => {
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
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : data ? (
            <DoctorStatsCard stats={data.stats} />
          ) : null}

          {/* Current Patient & Queue */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CurrentPatientCard
              employeeId={selectedEmployeeId}
            />
            <DoctorQueuePanel
              employeeId={selectedEmployeeId}
            />
          </div>

          {/* Completed Visits */}
          <CompletedVisitsList
            employeeId={selectedEmployeeId}
          />
        </>
      )}
    </div>
  );
};
