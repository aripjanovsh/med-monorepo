"use client";

import { use, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { LoadingState, ErrorState } from "@/components/states";
import { useConfirmDialog } from "@/components/dialogs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES, url } from "@/constants/route.constants";
import {
  useGetVisitQuery,
  useCompleteVisitMutation,
  isVisitEditable,
} from "@/features/visit";
import {
  VisitDetailHeader,
  VisitInfoCards,
  VisitDetailSections,
} from "@/features/visit/components/detail";

type PageProps = {
  params: Promise<{ id: string; visitId: string }>;
};

export default function PatientVisitDetailPage({ params }: PageProps) {
  const { id: patientId, visitId } = use(params);
  const router = useRouter();
  const confirm = useConfirmDialog();
  const { data: visit, isLoading, error, refetch } = useGetVisitQuery(visitId);
  const [completeVisit] = useCompleteVisitMutation();

  const handleCompleteVisit = useCallback(async () => {
    confirm({
      title: "Завершить прием?",
      description: "Вы уверены, что хотите завершить прием пациента?",
      onConfirm: async () => {
        try {
          await completeVisit({ id: visitId }).unwrap();
          toast.success("Прием завершен");
        } catch (error: unknown) {
          const errorMessage =
            error && typeof error === "object" && "data" in error
              ? (error.data as { message?: string })?.message
              : undefined;
          toast.error(errorMessage ?? "Ошибка при завершении");
        }
      },
    });
  }, [confirm, completeVisit, visitId]);

  if (isLoading) {
    return <LoadingState title="Загрузка данных визита..." />;
  }

  if (error || !visit) {
    return (
      <ErrorState
        title="Визит не найден"
        description="Не удалось загрузить данные визита"
        onRetry={refetch}
        onBack={() =>
          router.push(url(ROUTES.PATIENT_DETAIL, { id: patientId }))
        }
        backLabel="Вернуться к пациенту"
      />
    );
  }

  const editable = isVisitEditable(visit);

  return (
    <div className="space-y-6">
      <VisitDetailHeader
        visitDate={visit.visitDate}
        status={visit.status}
        isEditable={editable}
        onCompleteVisit={handleCompleteVisit}
      />

      <VisitInfoCards visit={visit} />

      <Separator />

      <VisitDetailSections visit={visit} isEditable={editable} />
    </div>
  );
}
