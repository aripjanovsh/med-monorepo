"use client";

import { use, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LoadingState, ErrorState } from "@/components/states";
import { useConfirmDialog } from "@/components/dialogs";
import { ROUTES } from "@/constants/route.constants";
import {
  useGetVisitQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
  useUpdateVisitMutation,
  isVisitEditable,
} from "@/features/visit";
import {
  VisitStickyHeader,
  VisitClinicalFields,
  VisitProtocolSection,
  VisitSidebar,
} from "@/features/visit/components/detail";
import { useGetPatientAllergiesQuery } from "@/features/patient-allergy";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import type { SavedProtocolData } from "@/features/visit/visit-protocol.types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function VisitDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirmDialog();
  const { data: visit, isLoading, error, refetch } = useGetVisitQuery(id);
  const [startVisit] = useStartVisitMutation();
  const [completeVisit] = useCompleteVisitMutation();
  const [updateVisit] = useUpdateVisitMutation();

  // State for copied protocol from history - MUST be before any conditional returns
  const [copiedProtocol, setCopiedProtocol] =
    useState<SavedProtocolData | null>(null);

  // Get patient allergies count for header warning
  const { data: allergiesData } = useGetPatientAllergiesQuery(
    { patientId: visit?.patient?.id ?? "", page: 1, limit: 100 },
    { skip: !visit?.patient?.id }
  );
  const allergiesCount = allergiesData?.data?.length ?? 0;

  const handleStartVisit = useCallback(async () => {
    try {
      await startVisit({ id }).unwrap();
      toast.success("Прием начат");
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage ?? "Ошибка при начале приема");
    }
  }, [startVisit, id]);

  const handleCompleteVisit = useCallback(async () => {
    confirm({
      title: "Завершить прием?",
      description: "Вы уверены, что хотите завершить прием пациента?",
      onConfirm: async () => {
        try {
          await completeVisit({ id }).unwrap();
          toast.success("Прием завершен");
        } catch (err: unknown) {
          const errorMessage =
            err && typeof err === "object" && "data" in err
              ? (err.data as { message?: string })?.message
              : undefined;
          toast.error(errorMessage ?? "Ошибка при завершении");
        }
      },
    });
  }, [confirm, completeVisit, id]);

  // Handlers for copying data from history - MUST be before any conditional returns
  const handleCopyComplaint = useCallback(
    async (text: string) => {
      try {
        await updateVisit({ id, complaint: text }).unwrap();
        refetch();
      } catch {
        toast.error("Ошибка при копировании");
      }
    },
    [updateVisit, id, refetch]
  );

  const handleCopyAnamnesis = useCallback(
    async (text: string) => {
      try {
        await updateVisit({ id, anamnesis: text }).unwrap();
        refetch();
      } catch {
        toast.error("Ошибка при копировании");
      }
    },
    [updateVisit, id, refetch]
  );

  const handleCopyDiagnosis = useCallback(
    async (text: string) => {
      try {
        await updateVisit({ id, diagnosis: text }).unwrap();
        refetch();
      } catch {
        toast.error("Ошибка при копировании");
      }
    },
    [updateVisit, id, refetch]
  );

  const handleCopyConclusion = useCallback(
    async (text: string) => {
      try {
        await updateVisit({ id, conclusion: text }).unwrap();
        refetch();
      } catch {
        toast.error("Ошибка при копировании");
      }
    },
    [updateVisit, id, refetch]
  );

  const handleCopyAll = useCallback(
    async (data: {
      complaint?: string;
      anamnesis?: string;
      diagnosis?: string;
      conclusion?: string;
      protocolData?: string;
      protocolId?: string;
    }) => {
      try {
        await updateVisit({
          id,
          complaint: data.complaint,
          anamnesis: data.anamnesis,
          diagnosis: data.diagnosis,
          conclusion: data.conclusion,
          protocolData: data.protocolData,
          protocolId: data.protocolId,
        }).unwrap();
        refetch();
      } catch {
        toast.error("Ошибка при копировании данных");
      }
    },
    [updateVisit, id, refetch]
  );

  // Handler for copying protocol from history
  const handleCopyProtocol = useCallback((protocolData: SavedProtocolData) => {
    setCopiedProtocol(protocolData);
  }, []);

  // Handler when protocol is applied
  const handleProtocolApplied = useCallback(() => {
    setCopiedProtocol(null);
  }, []);

  // Conditional returns AFTER all hooks
  if (isLoading) {
    return <LoadingState title="Загрузка данных визита..." />;
  }

  if (error || !visit) {
    return (
      <ErrorState
        title="Визит не найден"
        description="Не удалось загрузить данные визита"
        onRetry={refetch}
        onBack={() => router.push(ROUTES.VISITS)}
        backLabel="Вернуться к списку визитов"
      />
    );
  }

  const editable = isVisitEditable(visit);
  const canStart = visit.status === "WAITING";

  return (
    <>
      <LayoutHeader backHref={ROUTES.VISITS} backTitle="Визиты" />
      <CabinetContent className="space-y-6">
        {/* Sticky Header with Patient Info */}
        <VisitStickyHeader
          visit={visit}
          isEditable={editable}
          onStartVisit={canStart ? handleStartVisit : undefined}
          onCompleteVisit={handleCompleteVisit}
          allergiesCount={allergiesCount}
        />

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Clinical Data & Protocol */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clinical Fields */}
            <VisitClinicalFields visit={visit} isEditable={editable} />

            {/* Protocol Section */}
            <VisitProtocolSection
              visit={visit}
              externalProtocolData={copiedProtocol}
              onExternalProtocolApplied={handleProtocolApplied}
            />
          </div>

          {/* Right Column - Sidebar (Services, Prescriptions, History) */}
          <div className="lg:col-span-1">
            <VisitSidebar
              visit={visit}
              isEditable={editable}
              onCopyComplaint={handleCopyComplaint}
              onCopyAnamnesis={handleCopyAnamnesis}
              onCopyDiagnosis={handleCopyDiagnosis}
              onCopyConclusion={handleCopyConclusion}
              onCopyProtocol={handleCopyProtocol}
              onCopyAll={handleCopyAll}
            />
          </div>
        </div>
      </CabinetContent>
    </>
  );
}
