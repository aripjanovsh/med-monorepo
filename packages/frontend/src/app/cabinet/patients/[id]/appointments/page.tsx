"use client";

import { use } from "react";
import { PatientAppointments } from "@/features/patients/components/detail/patient-appointments";

export default function PatientAppointmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PatientAppointments patientId={id} />
    </div>
  );
}
