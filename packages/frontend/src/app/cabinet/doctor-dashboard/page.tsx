"use client";

import { DoctorQueuePanel } from "@/features/doctor/components/doctor-queue-panel";
import { DoctorStatsCard } from "@/features/doctor/components/doctor-stats-card";
import { CurrentPatientCard } from "@/features/doctor/components/current-patient-card";
import { CompletedVisitsList } from "@/features/doctor/components/completed-visits-list";
import { useGetDoctorQueueQuery } from "@/features/doctor/api/doctor.api";
import { Skeleton } from "@/components/ui/skeleton";

// TODO: Get from auth context
const MOCKED_DOCTOR_ID = "a7ec28fa-c3f5-466a-9796-cef3f73720d0";
const MOCKED_ORG_ID = "79de626d-f5b5-4818-b963-18e1c31c6acf";

export default function DoctorDashboardPage() {
  const { data, isLoading } = useGetDoctorQueueQuery({
    employeeId: MOCKED_DOCTOR_ID,
    organizationId: MOCKED_ORG_ID,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Панель врача</h1>
        <p className="text-muted-foreground">
          Управление приёмами и очередью пациентов
        </p>
      </div>

      <div className="space-y-6">
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
            employeeId={MOCKED_DOCTOR_ID}
            organizationId={MOCKED_ORG_ID}
          />
          <DoctorQueuePanel
            employeeId={MOCKED_DOCTOR_ID}
            organizationId={MOCKED_ORG_ID}
          />
        </div>

        {/* Completed Visits */}
        <CompletedVisitsList
          employeeId={MOCKED_DOCTOR_ID}
          organizationId={MOCKED_ORG_ID}
        />
      </div>
    </div>
  );
}
