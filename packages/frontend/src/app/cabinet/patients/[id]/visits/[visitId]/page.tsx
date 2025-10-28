"use client";

import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useGetVisitQuery,
  useUpdateVisitStatusMutation,
} from "@/features/visit";
import {
  VisitDetailHeader,
  VisitInfoCards,
  VisitDetailTabs,
} from "@/features/visit/components/detail";

type PageProps = {
  params: Promise<{ id: string; visitId: string }>;
};

export default function PatientVisitDetailPage({ params }: PageProps) {
  const { id: patientId, visitId } = use(params);
  const router = useRouter();
  const { data: visit, isLoading } = useGetVisitQuery(visitId);
  const [updateStatus] = useUpdateVisitStatusMutation();

  const handleCompleteVisit = async () => {
    if (!confirm("Завершить прием?")) return;

    try {
      await updateStatus({ id: visitId, status: "COMPLETED" }).unwrap();
      toast.success("Прием завершен");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage ?? "Ошибка при завершении");
    }
  };

  if (isLoading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (!visit) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/cabinet/patients/${patientId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Визит не найден</h1>
        </div>
      </div>
    );
  }

  const isEditable = visit.status === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      <VisitDetailHeader
        visitDate={visit.visitDate}
        status={visit.status}
        isEditable={isEditable}
        onCompleteVisit={handleCompleteVisit}
      />

      <VisitInfoCards visit={visit} />

      <Separator />

      <VisitDetailTabs visit={visit} isEditable={isEditable} />
    </div>
  );
}
