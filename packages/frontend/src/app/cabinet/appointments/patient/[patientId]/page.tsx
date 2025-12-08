"use client";

import { use } from "react";
import { FilteredAppointmentsPage } from "@/features/appointment/filtered-appointments-page";
import { useGetPatientQuery } from "@/features/patients/patient.api";

export default function PatientAppointmentsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const { data: patient } = useGetPatientQuery({ id: patientId });

  const patientName = patient
    ? `${patient.lastName} ${patient.firstName}`.trim()
    : undefined;

  return (
    <FilteredAppointmentsPage patientId={patientId} patientName={patientName} />
  );
}
