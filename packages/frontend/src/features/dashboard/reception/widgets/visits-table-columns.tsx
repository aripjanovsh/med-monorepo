"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Clock,
  Play,
  XCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES, url } from "@/constants/route.constants";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency.utils";
import { formatTimeAgo } from "@/features/visit/visit.model";

import type { VisitResponseDto } from "@/features/visit/visit.dto";
import { VisitStatusBadge } from "@/features/visit";
import { getPatientShortName } from "@/features/patients/patient.model";
import {
  getEmployeeShortName,
  getEmployeeTitle,
} from "@/features/employees/employee.model";
import {
  getVisitUnpaidTotal,
  hasVisitUnpaidServices,
} from "@/features/visit/visit.model";

// Helper for time color
const getTimeColor = (minutes: number) => {
  if (minutes < 15) return "text-green-600";
  if (minutes < 30) return "text-yellow-600";
  return "text-red-600";
};

type VisitsTableColumnsProps = {
  onCreateInvoice: (visit: VisitResponseDto) => void;
  onStartVisit: (visitId: string, patientName: string) => void;
  onCancelVisit: (visitId: string, patientName: string) => void;
  onCompleteVisit: (visitId: string, patientName: string) => void;
  onViewVisit: (visitId: string) => void;
};

// We extend the visit response to include the computed time value
export type VisitWithTime = VisitResponseDto & {
  timeValue: number;
};

export const getVisitsTableColumns = ({
  onCreateInvoice,
  onStartVisit,
  onCancelVisit,
  onCompleteVisit,
  onViewVisit,
}: VisitsTableColumnsProps): ColumnDef<VisitWithTime>[] => [
  {
    accessorKey: "patient",
    header: "Пациент",
    cell: ({ row }) => {
      const visit = row.original;
      const patient = visit.patient;
      const patientName = getPatientShortName(patient as any);
      const isEmergency = visit.appointment?.type === "EMERGENCY";

      return (
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
            <Badge variant="destructive" className="gap-1 shrink-0">
              <AlertTriangle className="h-3 w-3" />
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "employee",
    header: "Врач",
    cell: ({ row }) => {
      const visit = row.original;
      const employee = visit.employee;
      const employeeName = getEmployeeShortName(employee as any);
      const employeeTitle = getEmployeeTitle(employee as any);

      return (
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
      );
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => (
      <VisitStatusBadge status={row.original.status} size="sm" />
    ),
  },
  {
    accessorKey: "timeValue",
    header: "Время",
    cell: ({ row }) => {
      const visit = row.original;

      if (visit.status === "COMPLETED") {
        return (
          <span className="text-sm text-muted-foreground">
            {visit.completedAt ? formatTimeAgo(visit.completedAt) : "—"}
          </span>
        );
      }

      return (
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            getTimeColor(visit.timeValue)
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {visit.timeValue} мин
        </div>
      );
    },
  },
  {
    id: "amount",
    header: () => <div className="text-right">К оплате</div>,
    cell: ({ row }) => {
      const visit = row.original;
      const hasUnpaid =
        visit.status === "COMPLETED" && hasVisitUnpaidServices(visit);
      const unpaidTotal = hasUnpaid ? getVisitUnpaidTotal(visit) : 0;

      return (
        <div className="text-right">
          {hasUnpaid ? (
            <span className="font-semibold text-red-600">
              {formatCurrency(unpaidTotal)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Действия</div>,
    cell: ({ row }) => {
      const visit = row.original;
      const patientName = getPatientShortName(visit.patient as any);

      return (
        <div className="flex items-center justify-end gap-1">
          {visit.status === "WAITING" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartVisit(visit.id, patientName);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelVisit(visit.id, patientName);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewVisit(visit.id);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteVisit(visit.id, patientName);
                    }}
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
              onClick={(e) => {
                e.stopPropagation();
                onCreateInvoice(visit);
              }}
            >
              Счёт
            </Button>
          )}
        </div>
      );
    },
  },
];
