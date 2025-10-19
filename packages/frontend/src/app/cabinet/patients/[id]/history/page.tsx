"use client";

import { use } from "react";
import { PatientMedicalHistory } from "@/features/patients/components/detail/patient-medical-history";

export default function PatientHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PatientMedicalHistory patientId={id} />
    </div>
  );
}
