"use client";

import { useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDialog } from "@/lib/dialog-manager";
import { VisitProtocol } from "@/features/visit";
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
import type { VisitResponseDto } from "@/features/visit/visit.dto";
import type { SavedProtocolData } from "@/features/visit/visit-protocol.types";

type VisitDetailSectionsProps = {
  visit: VisitResponseDto;
  isEditable: boolean;
};

export const VisitDetailSections = ({
  visit,
  isEditable,
}: VisitDetailSectionsProps) => {
  // Early return if required data is missing
  if (!visit.patient || !visit.employee) {
    return null;
  }

  // Extract required data (TypeScript now knows they're defined)
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Left Side (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Protocol Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Протокол осмотра</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitProtocol
              visitId={visit.id}
              patientId={patient.id}
              initialProtocolId={visit.protocol?.id}
              initialProtocolData={
                visit.protocolData
                  ? (JSON.parse(visit.protocolData) as SavedProtocolData)
                  : null
              }
              status={visit.status}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Right Side (1/3 width) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Services and Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Назначения</CardTitle>
              {isEditable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddServices}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ServiceOrderListCompact visitId={visit.id} isEditable={isEditable} />
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Рецепты</CardTitle>
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
          <CardContent>
            <PrescriptionList visitId={visit.id} status={visit.status} />
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Аллергии</CardTitle>
              {isEditable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddAllergy}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!allergiesData || allergiesData.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Нет данных об аллергиях
              </p>
            ) : (
              <div className="space-y-3">
                {allergiesData.data.map((allergy) => (
                  <AllergyListItem key={allergy.id} allergy={allergy} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Показатели</CardTitle>
              {isEditable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddParameter}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!latestParameters || latestParameters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Нет данных о показателях
              </p>
            ) : (
              <div className="space-y-3">
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
                        {format(
                          new Date(param.measuredAt),
                          "dd.MM.yyyy HH:mm",
                          {
                            locale: ru,
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">
                        {formatParameterValue(param)}
                      </p>
                      {/* TODO: Добавить кнопку редактирования через dialog manager */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
