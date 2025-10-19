"use client";

import { use } from "react";
import { PatientVisits } from "@/features/patients/components/detail/patient-visits";

export default function PatientVisitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PatientVisits patientId={id} />
    </div>
  );
}
