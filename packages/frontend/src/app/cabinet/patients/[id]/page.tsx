"use client";

import { use } from "react";
import { useGetPatientQuery } from "@/features/patients";
import { PatientOverview } from "@/features/patients/components/detail/patient-overview";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: patient, isLoading } = useGetPatientQuery(
    { id: id as string },
    { skip: !id },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузка данных пациента...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PatientOverview patient={patient} />
    </div>
  );
}
