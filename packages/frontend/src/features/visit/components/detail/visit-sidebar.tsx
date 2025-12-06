"use client";

import { useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Plus,
  Pill,
  AlertTriangle,
  Activity,
  Stethoscope,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useDialog } from "@/lib/dialog-manager";
import {
  PrescriptionList,
  PatientPrescriptionsHistory,
} from "@/features/prescription";
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
  getAllergySeverityLabel,
} from "@/features/patient-allergy";
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

// Section header component for consistent styling
const SectionHeader = ({
  icon: Icon,
  title,
  count,
  onAdd,
  isEditable,
  variant = "default",
}: {
  icon: typeof Stethoscope;
  title: string;
  count?: number;
  onAdd?: () => void;
  isEditable: boolean;
  variant?: "default" | "warning";
}) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-2">
      <Icon
        className={cn(
          "h-4 w-4",
          variant === "warning" ? "text-orange-500" : "text-muted-foreground"
        )}
      />
      <span className="text-sm font-medium">{title}</span>
      {count !== undefined && count > 0 && (
        <Badge
          variant={variant === "warning" ? "destructive" : "secondary"}
          className="h-5 px-1.5 text-xs"
        >
          {count}
        </Badge>
      )}
    </div>
    {isEditable && onAdd && (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    )}
  </div>
);

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
  const allergies = useMemo(
    () => allergiesData?.data ?? [],
    [allergiesData?.data]
  );
  const parameters = useMemo(() => latestParameters ?? [], [latestParameters]);
  const parameterDefinitions = useMemo(
    () => definitionsData?.data ?? [],
    [definitionsData?.data]
  );

  const getParameterName = useCallback(
    (code: string) => {
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
    <Card className="sticky top-4">
      <CardContent className="p-3">
        <Accordion
          type="multiple"
          defaultValue={["services", "prescriptions", "allergies"]}
          className="space-y-1"
        >
          {/* Services Section */}
          <AccordionItem value="services" className="border-none">
            <AccordionTrigger className="py-2 px-2 hover:bg-muted/50 rounded-md hover:no-underline">
              <SectionHeader
                icon={Stethoscope}
                title="Назначения"
                onAdd={handleAddServices}
                isEditable={isEditable}
              />
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-1 pb-2">
              <ServiceOrderListCompact
                patientId={patient.id}
                isEditable={isEditable}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Prescriptions Section */}
          <AccordionItem value="prescriptions" className="border-none">
            <AccordionTrigger className="py-2 px-2 hover:bg-muted/50 rounded-md hover:no-underline">
              <SectionHeader
                icon={Pill}
                title="Рецепты"
                onAdd={handleAddPrescription}
                isEditable={isEditable}
              />
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-1 pb-2">
              <div className="space-y-3">
                {/* Current Visit Prescriptions */}
                <PrescriptionList visitId={visit.id} status={visit.status} />

                {/* Patient Prescription History (from other visits) */}
                <PatientPrescriptionsHistory
                  patientId={patient.id}
                  defaultCollapsed={true}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Allergies Section */}
          <AccordionItem value="allergies" className="border-none">
            <AccordionTrigger className="py-2 px-2 hover:bg-muted/50 rounded-md hover:no-underline">
              <SectionHeader
                icon={AlertTriangle}
                title="Аллергии"
                count={allergies.length}
                onAdd={handleAddAllergy}
                isEditable={isEditable}
                variant={allergies.length > 0 ? "warning" : "default"}
              />
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-1 pb-2">
              {allergies.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">
                  Нет данных об аллергиях
                </p>
              ) : (
                <div className="space-y-1.5">
                  {allergies.map((allergy) => (
                    <div
                      key={allergy.id}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-md transition-colors",
                        allergy.severity === "SEVERE"
                          ? "bg-red-50 dark:bg-red-950/30"
                          : allergy.severity === "MODERATE"
                            ? "bg-orange-50 dark:bg-orange-950/30"
                            : "bg-muted/30"
                      )}
                    >
                      <AlertTriangle
                        className={cn(
                          "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
                          allergy.severity === "SEVERE"
                            ? "text-red-500"
                            : allergy.severity === "MODERATE"
                              ? "text-orange-500"
                              : "text-muted-foreground"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {allergy.substance}
                        </p>
                        {allergy.reaction && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {allergy.reaction}
                          </p>
                        )}
                        {allergy.severity && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-1 text-[10px] h-4 px-1",
                              allergy.severity === "SEVERE"
                                ? "border-red-200 text-red-700 dark:text-red-400"
                                : allergy.severity === "MODERATE"
                                  ? "border-orange-200 text-orange-700 dark:text-orange-400"
                                  : ""
                            )}
                          >
                            {getAllergySeverityLabel(allergy.severity)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Parameters Section */}
          <AccordionItem value="parameters" className="border-none">
            <AccordionTrigger className="py-2 px-2 hover:bg-muted/50 rounded-md hover:no-underline">
              <SectionHeader
                icon={Activity}
                title="Показатели"
                count={parameters.length}
                onAdd={handleAddParameter}
                isEditable={isEditable}
              />
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-1 pb-2">
              {parameters.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">
                  Нет данных о показателях
                </p>
              ) : (
                <div className="space-y-1">
                  {parameters.map((param) => (
                    <div
                      key={param.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {getParameterName(param.parameterCode)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(
                            new Date(param.measuredAt),
                            "dd.MM.yy HH:mm",
                            { locale: ru }
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatParameterValue(param)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Visit History Section - only for editable visits */}
          {isEditable && (
            <AccordionItem value="history" className="border-none">
              <AccordionTrigger className="py-2 px-2 hover:bg-muted/50 rounded-md hover:no-underline">
                <SectionHeader
                  icon={History}
                  title="История визитов"
                  isEditable={false}
                />
              </AccordionTrigger>
              <AccordionContent className="px-0 pt-1 pb-2">
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
                  defaultCollapsed={false}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};
