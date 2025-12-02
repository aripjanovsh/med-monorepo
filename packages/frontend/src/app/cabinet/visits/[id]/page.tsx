"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LoadingState, ErrorState } from "@/components/states";
import { useConfirmDialog } from "@/components/dialogs";
import { ROUTES } from "@/constants/route.constants";
import {
  useGetVisitQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
  isVisitEditable,
} from "@/features/visit";
import {
  VisitDetailHeader,
  VisitInfoCards,
  VisitDetailSections,
} from "@/features/visit/components/detail";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";

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

  const handleStartVisit = useCallback(async () => {
    try {
      await startVisit({ id }).unwrap();
      toast.success("Прием начат");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
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
        } catch (error: unknown) {
          const errorMessage =
            error && typeof error === "object" && "data" in error
              ? (error.data as { message?: string })?.message
              : undefined;
          toast.error(errorMessage ?? "Ошибка при завершении");
        }
      },
    });
  }, [confirm, completeVisit, id]);

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
        <VisitDetailHeader
          visitDate={visit.visitDate}
          status={visit.status}
          queuedAt={visit.queuedAt}
          startedAt={visit.startedAt}
          isEditable={editable}
          onStartVisit={canStart ? handleStartVisit : undefined}
          onCompleteVisit={handleCompleteVisit}
        />

        <VisitInfoCards visit={visit} />

        <VisitDetailSections visit={visit} isEditable={editable} />
      </CabinetContent>
    </>
  );
}
