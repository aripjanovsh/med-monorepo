"use client";

import type { PatientResponseDto } from "../../patient.dto";
import { PatientDashboard } from "./patient-dashboard";

interface PatientOverviewProps {
  patient: PatientResponseDto;
}

export function PatientOverview({ patient }: PatientOverviewProps) {
  return <PatientDashboard patient={patient} />;
}
