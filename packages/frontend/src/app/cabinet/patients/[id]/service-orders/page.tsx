"use client";

import { use } from "react";
import { useGetPatientQuery } from "@/features/patients";
import { PatientServiceOrders } from "@/features/patients/components/detail/patient-service-orders";
import { LoadingState, ErrorState } from "@/components/states";

export default function PatientServiceOrdersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: patient, isLoading, error, refetch } = useGetPatientQuery(
    { id: id as string },
    { skip: !id }
  );

  if (isLoading) {
    return <LoadingState title="Загрузка назначений..." />;
  }

  if (error || !patient) {
    return (
      <ErrorState
        title="Пациент не найден"
        description="Не удалось загрузить данные пациента"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PatientServiceOrders patient={patient} />
    </div>
  );
}
