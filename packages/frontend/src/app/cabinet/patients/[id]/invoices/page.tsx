"use client";

import { use } from "react";
import { useGetPatientQuery } from "@/features/patients";
import { PatientInvoices } from "@/features/patients/components/detail/patient-invoices";
import { LoadingState, ErrorState } from "@/components/states";

export default function PatientInvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: patient,
    isLoading,
    error,
    refetch,
  } = useGetPatientQuery({ id: id as string }, { skip: !id });

  if (isLoading) {
    return <LoadingState title="Загрузка счетов..." />;
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
      <PatientInvoices patient={patient} />
    </div>
  );
}
