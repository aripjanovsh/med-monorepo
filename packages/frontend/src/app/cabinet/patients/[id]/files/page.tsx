"use client";

import { use } from "react";

import { useGetPatientQuery, PatientFiles } from "@/features/patients";
import { LoadingState, ErrorState } from "@/components/states";

export default function PatientFilesPage({
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
  } = useGetPatientQuery({ id }, { skip: !id });

  if (isLoading) {
    return <LoadingState title="Загрузка файлов пациента..." />;
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
      <PatientFiles patient={patient} />
    </div>
  );
}
