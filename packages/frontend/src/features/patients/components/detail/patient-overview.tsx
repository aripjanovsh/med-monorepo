"use client";

import type { ReactElement } from "react";

import type { PatientResponseDto } from "../../patient.dto";
import { PatientDashboard } from "./patient-dashboard";

type PatientOverviewProps = {
  patient: PatientResponseDto;
};

export const PatientOverview = ({
  patient,
}: PatientOverviewProps): ReactElement => {
  return <PatientDashboard patientId={patient.id} />;
};
