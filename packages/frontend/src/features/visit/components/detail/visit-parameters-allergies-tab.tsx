"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AddParameterDialog,
  EditParameterDialog,
} from "@/features/patient-parameter/components";
import {
  AddPatientAllergyDialog,
  EditPatientAllergyDialog,
  useGetPatientAllergiesQuery,
} from "@/features/patient-allergy";
import { useGetLatestPatientParametersQuery } from "@/features/patient-parameter/patient-parameter.api";
import { useGetParameterDefinitionsQuery } from "@/features/parameter-definition";

type VisitParametersAllergiesTabProps = {
  patientId: string;
  visitId: string;
  employeeId: string;
  isEditable: boolean;
};

export const VisitParametersAllergiesTab = ({
  patientId,
  visitId,
  employeeId,
  isEditable,
}: VisitParametersAllergiesTabProps) => {
  const { data: latestParameters } =
    useGetLatestPatientParametersQuery(patientId);
  const { data: allergiesData } = useGetPatientAllergiesQuery({
    patientId,
    page: 1,
    limit: 100,
  });
  const { data: definitionsData } = useGetParameterDefinitionsQuery({
    isActive: true,
  });
  const parameterDefinitions = definitionsData?.data ?? [];

  const getParameterName = (code: string) => {
    return parameterDefinitions.find((p) => p.code === code)?.name ?? code;
  };

  const formatParameterValue = (param: {
    valueNumeric?: number | null;
    valueText?: string | null;
    valueBoolean?: boolean | null;
    unit?: string | null;
  }) => {
    if (param.valueNumeric !== null && param.valueNumeric !== undefined) {
      return `${param.valueNumeric} ${param.unit ?? ""}`;
    }
    if (param.valueText) return param.valueText;
    if (param.valueBoolean !== null) return param.valueBoolean ? "Да" : "Нет";
    return "-";
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case "MILD":
        return "Легкая";
      case "MODERATE":
        return "Средняя";
      case "SEVERE":
        return "Тяжелая";
      default:
        return "-";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Patient Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Показатели пациента</CardTitle>
            {isEditable && (
              <AddParameterDialog
                patientId={patientId}
                visitId={visitId}
                recordedById={employeeId}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!latestParameters || latestParameters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет данных о параметрах
            </p>
          ) : (
            <div className="space-y-3">
              {latestParameters.map((param) => (
                <div
                  key={param.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
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
                    <p className="font-semibold">
                      {formatParameterValue(param)}
                    </p>
                    {isEditable && <EditParameterDialog parameter={param} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Аллергии</CardTitle>
            {isEditable && (
              <AddPatientAllergyDialog
                patientId={patientId}
                visitId={visitId}
                recordedById={employeeId}
              />
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
                <div key={allergy.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium">{allergy.substance}</p>
                      {allergy.reaction && (
                        <p className="text-sm text-muted-foreground">
                          Реакция: {allergy.reaction}
                        </p>
                      )}
                      {allergy.severity && (
                        <p className="text-sm">
                          Степень: {getSeverityLabel(allergy.severity)}
                        </p>
                      )}
                      {allergy.note && (
                        <p className="text-xs text-muted-foreground">
                          {allergy.note}
                        </p>
                      )}
                    </div>
                    {isEditable && (
                      <div className="ml-2">
                        <EditPatientAllergyDialog allergy={allergy} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
