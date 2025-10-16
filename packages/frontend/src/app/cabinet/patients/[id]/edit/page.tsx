"use client";

import { useParams } from "next/navigation";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PagePatientForm } from "@/features/patients/components/page-patient-form";
import { useGetPatientQuery } from "@/features/patients";
import { Loader2 } from "lucide-react";

export default function EditPatientPage() {
  const params = useParams();
  const patientId = params.id as string;

  const {
    data: patient,
    isLoading,
    error,
  } = useGetPatientQuery({ id: patientId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LayoutHeader backHref="/cabinet/patients" backTitle="Пациенты" />
        <PageHeader title="Редактирование пациента" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <LayoutHeader backHref="/cabinet/patients" backTitle="Пациенты" />
        <PageHeader title="Редактирование пациента" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500">
              Ошибка при загрузке данных пациента
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/patients" backTitle="Пациенты" />
      <PageHeader 
        title={`Редактирование: ${patient.firstName} ${patient.lastName}`} 
      />
      <PagePatientForm patient={patient} mode="edit" />
    </div>
  );
}
