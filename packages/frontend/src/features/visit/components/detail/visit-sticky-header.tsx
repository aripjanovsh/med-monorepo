"use client";

import { useEffect, useState, useMemo } from "react";
import { format, differenceInSeconds, differenceInYears } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Clock,
  Play,
  Timer,
  User,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Phone,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VisitStatusBadge } from "../visit-status-badge";
import type { VisitStatus } from "../../visit.constants";
import type { VisitResponseDto } from "../../visit.dto";
import { ROUTES, url } from "@/constants/route.constants";

type VisitStickyHeaderProps = {
  visit: VisitResponseDto;
  isEditable: boolean;
  onStartVisit?: () => void;
  onCompleteVisit: () => void;
  allergiesCount?: number;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number): string => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
};

const useLiveTimer = (startTime?: string, isActive?: boolean): number => {
  const [seconds, setSeconds] = useState(() => {
    if (!startTime) return 0;
    return Math.max(0, differenceInSeconds(new Date(), new Date(startTime)));
  });

  useEffect(() => {
    if (!startTime || !isActive) return;

    const interval = setInterval(() => {
      setSeconds(
        Math.max(0, differenceInSeconds(new Date(), new Date(startTime)))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  return seconds;
};

const getGenderLabel = (gender?: string): string => {
  if (!gender) return "";
  const genderMap: Record<string, string> = {
    MALE: "М",
    FEMALE: "Ж",
    male: "М",
    female: "Ж",
  };
  return genderMap[gender] ?? gender;
};

const calculateAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null;
  return differenceInYears(new Date(), new Date(dateOfBirth));
};

export const VisitStickyHeader = ({
  visit,
  isEditable,
  onStartVisit,
  onCompleteVisit,
  allergiesCount = 0,
}: VisitStickyHeaderProps) => {
  const isWaiting = visit.status === "WAITING";
  const isInProgress = visit.status === "IN_PROGRESS";

  const waitingSeconds = useLiveTimer(visit.queuedAt, isWaiting);
  const serviceSeconds = useLiveTimer(visit.startedAt, isInProgress);

  const patientAge = useMemo(
    () => calculateAge(visit.patient?.dateOfBirth),
    [visit.patient?.dateOfBirth]
  );

  const patientFullName = useMemo(() => {
    if (!visit.patient) return "—";
    const { lastName, firstName, middleName } = visit.patient;
    return [lastName, firstName, middleName].filter(Boolean).join(" ");
  }, [visit.patient]);

  const doctorName = useMemo(() => {
    if (!visit.employee) return "—";
    const { lastName, firstName } = visit.employee;
    return `${lastName} ${firstName?.charAt(0) ?? ""}.`;
  }, [visit.employee]);

  return (
    <div className="sticky top-0 z-10 -mx-6 px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side - Patient & Doctor Info */}
        <div className="flex items-center gap-6 min-w-0">
          {/* Patient Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={url(ROUTES.PATIENT_DETAIL, {
                    id: visit.patient?.id ?? "",
                  })}
                  className="font-semibold text-lg truncate hover:text-primary transition-colors"
                >
                  {patientFullName}
                </Link>
                {patientAge !== null && (
                  <Badge variant="outline" className="shrink-0">
                    {patientAge} лет
                  </Badge>
                )}
                {visit.patient?.gender && (
                  <Badge variant="secondary" className="shrink-0">
                    {getGenderLabel(visit.patient.gender)}
                  </Badge>
                )}
                {allergiesCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="destructive"
                        className="gap-1 shrink-0 cursor-help"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {allergiesCount} аллерг.
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      У пациента {allergiesCount} зафиксированных аллергий
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {doctorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(visit.visitDate), "dd MMM yyyy, HH:mm", {
                    locale: ru,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Status, Timers & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status */}
          <VisitStatusBadge status={visit.status} />

          {/* Waiting Timer */}
          {(isWaiting || isInProgress || visit.status === "COMPLETED") &&
            visit.queuedAt && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono text-sm font-bold">
                      {formatDuration(waitingSeconds)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Время ожидания</TooltipContent>
              </Tooltip>
            )}

          {/* Service Timer */}
          {(isInProgress || visit.status === "COMPLETED") &&
            visit.startedAt && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                    <Timer className="h-4 w-4" />
                    <span className="font-mono text-sm font-bold">
                      {formatDuration(serviceSeconds)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Время приема</TooltipContent>
              </Tooltip>
            )}

          {/* Action Buttons */}
          {isWaiting && onStartVisit && (
            <Button onClick={onStartVisit} className="gap-2">
              <Play className="h-4 w-4" />
              Начать прием
            </Button>
          )}
          {isEditable && (
            <Button onClick={onCompleteVisit} variant="default">
              Завершить прием
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
