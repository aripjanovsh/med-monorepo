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
import { ServiceOrderList } from "@/features/service-order/components/service-order-list";
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
import type { FilledFormData } from "@/features/form-builder";

type VisitDetailSectionsProps = {
  visit: VisitResponseDto;
  isEditable: boolean;
};

export const VisitDetailSections = ({
  visit,
  isEditable,
}: VisitDetailSectionsProps) => {
  // Dialog managers
  const addPrescriptionDialog = useDialog(AddPrescriptionDialog);
  const addAllergyDialog = useDialog(AddPatientAllergyDialog);
  const addParameterDialog = useDialog(AddParameterDialog);
  const addServicesDialog = useDialog(AddServicesDialog);

  // Data queries
  const { data: latestParameters } = useGetLatestPatientParametersQuery(
    visit.patient.id
  );
  const { data: allergiesData } = useGetPatientAllergiesQuery({
    patientId: visit.patient.id,
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
      employeeId: visit.employee.id,
    });
  }, [addPrescriptionDialog, visit.id, visit.employee.id]);

  const handleAddAllergy = useCallback(() => {
    addAllergyDialog.open({
      patientId: visit.patient.id,
      visitId: visit.id,
      recordedById: visit.employee.id,
    });
  }, [addAllergyDialog, visit.patient.id, visit.id, visit.employee.id]);

  const handleAddParameter = useCallback(() => {
    addParameterDialog.open({
      patientId: visit.patient.id,
      visitId: visit.id,
      recordedById: visit.employee.id,
    });
  }, [addParameterDialog, visit.patient.id, visit.id, visit.employee.id]);

  const handleAddServices = useCallback(() => {
    addServicesDialog.open({
      visitId: visit.id,
      patientId: visit.patient.id,
      doctorId: visit.employee.id,
    });
  }, [addServicesDialog, visit.id, visit.patient.id, visit.employee.id]);

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
              initialProtocolId={visit.protocol?.id}
              initialProtocolData={
                visit.protocolData
                  ? (JSON.parse(visit.protocolData) as FilledFormData)
                  : {}
              }
              status={visit.status}
            />
          </CardContent>
        </Card>

        {/* Services and Orders Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Назначения и услуги</CardTitle>
              {isEditable && (
                <Button onClick={handleAddServices} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ServiceOrderList visitId={visit.id} isEditable={isEditable} />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Right Side (1/3 width) */}
      <div className="lg:col-span-1 space-y-6">
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
