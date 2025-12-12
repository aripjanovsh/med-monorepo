"use client";

import { useState, useMemo, useCallback } from "react";
import { differenceInMinutes, startOfToday, endOfToday } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Search,
  Play,
  XCircle,
  CheckCircle,
  FileText,
  Eye,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionSwitcher } from "@/components/ui/option-switcher";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptDialog } from "@/components/dialogs/prompt-dialog";
import { useDialog } from "@/lib/dialog-manager/dialog-manager.hook";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState, LoadingState } from "@/components/states";
import { ROUTES, url } from "@/constants/route.constants";

import {
  useGetVisitsQuery,
  useCancelVisitMutation,
  useStartVisitMutation,
  useCompleteVisitMutation,
  VisitStatusBadge,
} from "@/features/visit";
import type {
  VisitResponseDto,
  VisitsQueryParamsDto,
} from "@/features/visit/visit.dto";
import type { VisitStatus } from "@/features/visit/visit.constants";
import { getPatientShortName } from "@/features/patients/patient.model";
import {
  getEmployeeShortName,
  getEmployeeTitle,
} from "@/features/employees/employee.model";
import {
  formatTimeAgo,
  getVisitUnpaidTotal,
  hasVisitUnpaidServices,
} from "@/features/visit/visit.model";
import { formatCurrency } from "@/lib/currency.utils";

const REFRESH_INTERVAL_MS = 30000;

type StatusFilter = "ALL" | "WAITING" | "IN_PROGRESS" | "COMPLETED";

const STATUS_OPTIONS = [
  { value: "ALL" as const, label: "Все" },
  { value: "WAITING" as const, label: "В очереди" },
  { value: "IN_PROGRESS" as const, label: "На приёме" },
  { value: "COMPLETED" as const, label: "Завершён" },
];

const getTimeColor = (minutes: number) => {
  if (minutes < 15) return "text-green-600";
  if (minutes < 30) return "text-yellow-600";
  return "text-red-600";
};

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
      label: `${opt.label} (${statusCounts[opt.value]})`,
    }));
  }, [statusCounts]);

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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      </CardHeader>
      <CardContent className="pt-0">
        {filteredVisits.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Нет визитов"
            description={
              searchQuery
                ? "Попробуйте изменить параметры поиска"
                : "Визиты за сегодня отсутствуют"
            }
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Пациент</TableHead>
                  <TableHead className="w-[220px]">Врач</TableHead>
                  <TableHead className="w-[140px]">Статус</TableHead>
                  <TableHead className="w-[100px]">Время</TableHead>
                  <TableHead className="w-[100px] text-right">
                    К оплате
                  </TableHead>
                  <TableHead className="w-[160px] text-right">
                    Действия
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.map((visit) => {
                  const patient = visit.patient;
                  const employee = visit.employee;
                  const patientName = getPatientShortName(patient as any);
                  const employeeName = getEmployeeShortName(employee as any);
                  const employeeTitle = getEmployeeTitle(employee as any);
                  const isEmergency = visit.appointment?.type === "EMERGENCY";
                  const hasUnpaid =
                    visit.status === "COMPLETED" &&
                    hasVisitUnpaidServices(visit);
                  const unpaidTotal = hasUnpaid
                    ? getVisitUnpaidTotal(visit)
                    : 0;

                  return (
                    <TableRow key={visit.id}>
                      {/* Patient Column */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <Link
                              href={url(ROUTES.PATIENT_DETAIL, {
                                id: patient?.id,
                              })}
                              className="font-medium hover:underline truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {patientName}
                            </Link>
                            {patient?.patientId && (
                              <div className="text-xs text-muted-foreground">
                                {patient.patientId}
                              </div>
                            )}
                          </div>
                          {isEmergency && (
                            <Badge
                              variant="destructive"
                              className="gap-1 shrink-0"
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Doctor Column */}
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <UserAvatar
                            avatarId={employee?.avatarId}
                            name={employeeName}
                            className="h-8"
                            size={24}
                          />
                          <div className="min-w-0">
                            <Link
                              href={url(ROUTES.EMPLOYEE_DETAIL, {
                                id: employee?.id,
                              })}
                              className="font-medium hover:underline truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {employeeName}
                            </Link>
                            <div className="text-xs text-muted-foreground truncate">
                              {employeeTitle}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        <VisitStatusBadge
                          status={visit.status as VisitStatus}
                          size="sm"
                        />
                      </TableCell>

                      {/* Time Column */}
                      <TableCell>
                        {visit.status === "COMPLETED" ? (
                          <span className="text-sm text-muted-foreground">
                            {visit.completedAt
                              ? formatTimeAgo(visit.completedAt)
                              : "—"}
                          </span>
                        ) : (
                          <div
                            className={cn(
                              "flex items-center gap-1 text-sm font-medium",
                              getTimeColor(visit.timeValue)
                            )}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {visit.timeValue} мин
                          </div>
                        )}
                      </TableCell>

                      {/* Amount Column */}
                      <TableCell className="text-right">
                        {hasUnpaid ? (
                          <span className="font-semibold text-red-600">
                            {formatCurrency(unpaidTotal)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {visit.status === "WAITING" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleStartVisit(visit.id, patientName)
                                    }
                                  >
                                    <Play className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Начать приём</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleCancelVisit(visit.id, patientName)
                                    }
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Отменить визит</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                          {visit.status === "IN_PROGRESS" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => handleViewVisit(visit.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Открыть визит</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleCompleteVisit(visit.id, patientName)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Завершить приём</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                          {visit.status === "COMPLETED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCreateInvoice(visit)}
                            >
                              Счёт
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
