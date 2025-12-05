"use client";

import { useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDialog } from "@/lib/dialog-manager";
import { PrescriptionList } from "@/features/prescription/components/prescription-list";
import { AddPrescriptionDialog } from "@/features/prescription/components/add-prescription-dialog";
import { ServiceOrderListCompact } from "@/features/service-order";
import { AddServicesDialog } from "@/features/service-order/components/add-services-dialog";
import {
  AddParameterDialog,
  useGetLatestPatientParametersQuery,
  formatParameterValue,
} from "@/features/patient-parameter";
import {
  AddPatientAllergyDialog,
  useGetPatientAllergiesQuery,
} from "@/features/patient-allergy";
import { AllergyListItem } from "./allergy-list-item";
import { useGetParameterDefinitionsQuery } from "@/features/parameter-definition";
import { PatientVisitHistory } from "./patient-visit-history";
import type { VisitResponseDto } from "../../visit.dto";
import type { SavedProtocolData } from "../../visit-protocol.types";

type VisitSidebarProps = {
  visit: VisitResponseDto;
  isEditable: boolean;
  onCopyComplaint?: (text: string) => void;
  onCopyAnamnesis?: (text: string) => void;
  onCopyDiagnosis?: (text: string) => void;
  onCopyConclusion?: (text: string) => void;
  onCopyProtocol?: (protocolData: SavedProtocolData) => void;
  onCopyAll?: (data: {
    complaint?: string;
    anamnesis?: string;
    diagnosis?: string;
    conclusion?: string;
    protocolData?: string;
    protocolId?: string;
  }) => void;
};

export const VisitSidebar = ({
  visit,
  isEditable,
  onCopyComplaint,
  onCopyAnamnesis,
  onCopyDiagnosis,
  onCopyConclusion,
  onCopyProtocol,
  onCopyAll,
}: VisitSidebarProps) => {
  // Early return if required data is missing
  if (!visit.patient || !visit.employee) {
    return null;
  }

  const patient = visit.patient;
  const employee = visit.employee;

  // Dialog managers
  const addPrescriptionDialog = useDialog(AddPrescriptionDialog);
  const addAllergyDialog = useDialog(AddPatientAllergyDialog);
  const addParameterDialog = useDialog(AddParameterDialog);
  const addServicesDialog = useDialog(AddServicesDialog);

  // Data queries
  const { data: latestParameters } = useGetLatestPatientParametersQuery(
    patient.id
  );
  const { data: allergiesData } = useGetPatientAllergiesQuery({
    patientId: patient.id,
    page: 1,
    limit: 100,
  });
  const { data: definitionsData } = useGetParameterDefinitionsQuery({
    isActive: true,
  });

  // Memoized values
  const parameterDefinitions = useMemo(
    () => definitionsData?.data ?? [],
    [definitionsData?.data]
  );

  const getParameterName = useMemo(
    () => (code: string) => {
      return parameterDefinitions.find((p) => p.code === code)?.name ?? code;
    },
    [parameterDefinitions]
  );

  // Handlers
  const handleAddPrescription = useCallback(() => {
    addPrescriptionDialog.open({
      visitId: visit.id,
      employeeId: employee.id,
    });
  }, [addPrescriptionDialog, visit.id, employee.id]);

  const handleAddAllergy = useCallback(() => {
    addAllergyDialog.open({
      patientId: patient.id,
      visitId: visit.id,
      recordedById: employee.id,
    });
  }, [addAllergyDialog, patient.id, visit.id, employee.id]);

  const handleAddParameter = useCallback(() => {
    addParameterDialog.open({
      patientId: patient.id,
      visitId: visit.id,
      recordedById: employee.id,
    });
  }, [addParameterDialog, patient.id, visit.id, employee.id]);

  const handleAddServices = useCallback(() => {
    addServicesDialog.open({
      visitId: visit.id,
      patientId: patient.id,
      doctorId: employee.id,
    });
  }, [addServicesDialog, visit.id, patient.id, employee.id]);

  return (
    <div className="space-y-4">
      {/* Services and Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Назначения</CardTitle>
            {isEditable && (
              <Button variant="ghost" size="icon" onClick={handleAddServices}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ServiceOrderListCompact visitId={visit.id} isEditable={isEditable} />
        </CardContent>
      </Card>

      {/* Prescriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Рецепты</CardTitle>
            {isEditable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddPrescription}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <PrescriptionList visitId={visit.id} status={visit.status} />
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Аллергии</CardTitle>
            {isEditable && (
              <Button variant="ghost" size="icon" onClick={handleAddAllergy}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!allergiesData || allergiesData.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет данных об аллергиях
            </p>
          ) : (
            <div className="space-y-2">
              {allergiesData.data.map((allergy) => (
                <AllergyListItem key={allergy.id} allergy={allergy} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Parameters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Показатели</CardTitle>
            {isEditable && (
              <Button variant="ghost" size="icon" onClick={handleAddParameter}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!latestParameters || latestParameters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет данных о показателях
            </p>
          ) : (
            <div className="space-y-2">
              {latestParameters.map((param) => (
                <div
                  key={param.id}
                  className="flex items-start justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {getParameterName(param.parameterCode)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(param.measuredAt), "dd.MM.yyyy HH:mm", {
                        locale: ru,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {formatParameterValue(param)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Visit History - only for editable (non-completed) visits */}
      {isEditable && (
        <PatientVisitHistory
          patientId={patient.id}
          currentVisitId={visit.id}
          isEditable={isEditable}
          onCopyComplaint={onCopyComplaint}
          onCopyAnamnesis={onCopyAnamnesis}
          onCopyDiagnosis={onCopyDiagnosis}
          onCopyConclusion={onCopyConclusion}
          onCopyProtocol={onCopyProtocol}
          onCopyAll={onCopyAll}
          defaultCollapsed={true}
        />
      )}
    </div>
  );
};
