"use client";

import {
  AnalysisFormView,
  type SavedAnalysisData,
  type PatientGender,
} from "@/features/analysis-form-builder";

// Re-export type for backward compatibility
export type AnalysisResultData = SavedAnalysisData;

interface AnalysisResultViewProps {
  data: SavedAnalysisData;
  patientGender?: PatientGender;
  patientAge?: number;
}

export const AnalysisResultView = ({
  data,
  patientGender,
  patientAge,
}: AnalysisResultViewProps) => {
  return (
    <AnalysisFormView
      data={data.filledData}
      patientGender={patientGender}
      patientAge={patientAge}
    />
  );
};
