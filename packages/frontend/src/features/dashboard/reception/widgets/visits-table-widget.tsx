"use client";

import { useState, useMemo, useCallback } from "react";
import { differenceInMinutes, startOfToday, endOfToday } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { OptionSwitcher } from "@/components/ui/option-switcher";
import { DataTable } from "@/components/data-table";
import { PromptDialog } from "@/components/dialogs/prompt-dialog";
import { useDialog } from "@/lib/dialog-manager/dialog-manager.hook";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState, LoadingState } from "@/components/states";
import { ROUTES, url } from "@/constants/route.constants";

import { getVisitsTableColumns } from "./visits-table-columns";

import {
  useGetVisitsQuery,
  useCancelVisitMutation,
  useStartVisitMutation,
  useCompleteVisitMutation,
} from "@/features/visit";
import type {
  VisitResponseDto,
  VisitsQueryParamsDto,
} from "@/features/visit/visit.dto";
import { getPatientShortName } from "@/features/patients/patient.model";
import { getEmployeeShortName } from "@/features/employees/employee.model";

const REFRESH_INTERVAL_MS = 30000;

type StatusFilter = "ALL" | "WAITING" | "IN_PROGRESS" | "COMPLETED";

const STATUS_OPTIONS = [
  { value: "ALL" as const, label: "Все" },
  { value: "WAITING" as const, label: "В очереди" },
  { value: "IN_PROGRESS" as const, label: "На приёме" },
  { value: "COMPLETED" as const, label: "Завершён" },
];

type VisitsTableWidgetProps = {
  onCreateInvoice: (visit: VisitResponseDto) => void;
};

export const VisitsTableWidget = ({
  onCreateInvoice,
}: VisitsTableWidgetProps) => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const cancelPrompt = useDialog(PromptDialog);

  // Single query to fetch all today's visits (multiple statuses via comma-separated string)
  const { data, isLoading, error } = useGetVisitsQuery(
    {
      sortBy: "createdAt",
      sortOrder: "desc",
      dateFrom: startOfToday().toISOString(),
      dateTo: endOfToday().toISOString(),
      include: ["patient", "employee", "appointment", "serviceOrders"],
      limit: 100,
    } as unknown as VisitsQueryParamsDto,
    { pollingInterval: REFRESH_INTERVAL_MS }
  );

  const [cancelVisit] = useCancelVisitMutation();
  const [startVisit] = useStartVisitMutation();
  const [completeVisit] = useCompleteVisitMutation();

  const handleStartVisit = useCallback(
    async (visitId: string, patientName: string) => {
      try {
        await startVisit({ id: visitId }).unwrap();
        toast.success(`Приём пациента ${patientName} начат`);
      } catch {
        toast.error("Не удалось начать приём");
      }
    },
    [startVisit]
  );

  const handleCancelVisit = useCallback(
    (visitId: string, patientName: string) => {
      cancelPrompt.open({
        title: "Отменить визит",
        description: `Вы действительно хотите отменить визит пациента ${patientName}?`,
        label: "Причина отмены (опционально)",
        placeholder: "Укажите причину отмены...",
        confirmText: "Отменить визит",
        cancelText: "Отмена",
        multiline: true,
        required: false,
        onConfirm: async (cancelReason: string) => {
          try {
            await cancelVisit({
              id: visitId,
              cancelReason: cancelReason.trim() || undefined,
            }).unwrap();
            toast.success(`Визит пациента ${patientName} отменён`);
            cancelPrompt.close();
          } catch {
            toast.error("Не удалось отменить визит");
          }
        },
      });
    },
    [cancelVisit, cancelPrompt]
  );

  const handleCompleteVisit = useCallback(
    async (visitId: string, patientName: string) => {
      try {
        await completeVisit({ id: visitId }).unwrap();
        toast.success(`Приём пациента ${patientName} завершён`);
      } catch {
        toast.error("Не удалось завершить приём");
      }
    },
    [completeVisit]
  );

  const handleViewVisit = useCallback(
    (visitId: string) => {
      router.push(url(ROUTES.VISIT_DETAIL, { id: visitId }));
    },
    [router]
  );

  // Process visits with computed time values
  const allVisits = useMemo(() => {
    const visits = data?.data ?? [];
    return visits.map((v) => {
      let timeValue = 0;
      if (v.status === "WAITING" && v.queuedAt) {
        timeValue = differenceInMinutes(new Date(), new Date(v.queuedAt));
      } else if (v.status === "IN_PROGRESS" && v.startedAt) {
        timeValue = differenceInMinutes(new Date(), new Date(v.startedAt));
      }
      return { ...v, timeValue };
    });
  }, [data?.data]);

  // Filter visits
  const filteredVisits = useMemo(() => {
    let result = allVisits;

    // Filter by status
    if (statusFilter !== "ALL") {
      result = result.filter((v) => v.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((v) => {
        const patientName = getPatientShortName(v.patient as any).toLowerCase();
        const doctorName = getEmployeeShortName(
          v.employee as any
        ).toLowerCase();
        return patientName.includes(query) || doctorName.includes(query);
      });
    }

    // Sort: WAITING first (by queuedAt asc), then IN_PROGRESS (by startedAt asc), then COMPLETED (by completedAt desc)
    result.sort((a, b) => {
      const statusOrder = { WAITING: 0, IN_PROGRESS: 1, COMPLETED: 2 };
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;

      // Same status - sort by time
      if (a.status === "WAITING") {
        return (
          new Date(a.queuedAt ?? 0).getTime() -
          new Date(b.queuedAt ?? 0).getTime()
        );
      }
      if (a.status === "IN_PROGRESS") {
        return (
          new Date(a.startedAt ?? 0).getTime() -
          new Date(b.startedAt ?? 0).getTime()
        );
      }
      // COMPLETED - newest first
      return (
        new Date(b.completedAt ?? 0).getTime() -
        new Date(a.completedAt ?? 0).getTime()
      );
    });

    return result;
  }, [allVisits, statusFilter, searchQuery]);

  // Counts for status filter
  const statusCounts = useMemo(() => {
    const counts = { ALL: 0, WAITING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    for (const v of allVisits) {
      counts.ALL++;
      if (v.status in counts) {
        counts[v.status as keyof typeof counts]++;
      }
    }
    return counts;
  }, [allVisits]);

  const statusOptionsWithCount = useMemo(() => {
    return STATUS_OPTIONS.map((opt) => ({
      ...opt,
      label: (
        <div className="flex items-center gap-2">
          {opt.label} <Badge variant="outline">{statusCounts[opt.value]}</Badge>
        </div>
      ),
    }));
  }, [statusCounts]);

  // Columns definition with handlers
  const columns = useMemo(
    () =>
      getVisitsTableColumns({
        onCreateInvoice,
        onStartVisit: handleStartVisit,
        onCancelVisit: handleCancelVisit,
        onCompleteVisit: handleCompleteVisit,
        onViewVisit: handleViewVisit,
      }),
    [
      onCreateInvoice,
      handleStartVisit,
      handleCancelVisit,
      handleCompleteVisit,
      handleViewVisit,
    ]
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-semibold">Визиты за сегодня</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по пациенту или врачу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[280px]"
            />
          </div>
          <OptionSwitcher
            options={statusOptionsWithCount}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredVisits}
        emptyState={
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Нет визитов"
            description={
              searchQuery
                ? "Попробуйте изменить параметры поиска"
                : "Визиты за сегодня отсутствуют"
            }
          />
        }
      />
    </div>
  );
};
