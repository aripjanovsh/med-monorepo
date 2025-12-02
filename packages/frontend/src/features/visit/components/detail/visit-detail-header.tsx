"use client";

import { useEffect, useState } from "react";
import { format, differenceInSeconds } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, Play, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VisitStatusBadge } from "@/features/visit/components/visit-status-badge";
import type { VisitStatus } from "@/features/visit/visit.constants";

type VisitDetailHeaderProps = {
  visitDate: string;
  status: VisitStatus;
  queuedAt?: string;
  startedAt?: string;
  isEditable: boolean;
  onStartVisit?: () => void;
  onCompleteVisit: () => void;
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

export const VisitDetailHeader = ({
  visitDate,
  status,
  queuedAt,
  startedAt,
  isEditable,
  onStartVisit,
  onCompleteVisit,
}: VisitDetailHeaderProps) => {
  const isWaiting = status === "WAITING";
  const isInProgress = status === "IN_PROGRESS";

  const waitingSeconds = useLiveTimer(queuedAt, isWaiting);
  const serviceSeconds = useLiveTimer(startedAt, isInProgress);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Детали приема</h1>
          <p className="text-muted-foreground">
            {format(new Date(visitDate), "dd MMMM yyyy, HH:mm", {
              locale: ru,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {(isWaiting || isInProgress || status === "COMPLETED") && queuedAt && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Ожидание:</span>
            <span className="font-mono text-sm font-bold">
              {formatDuration(waitingSeconds)}
            </span>
          </div>
        )}
        {(isInProgress || status === "COMPLETED") && startedAt && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <Timer className="h-4 w-4" />
            <span className="text-sm font-medium">Время приема:</span>
            <span className="font-mono text-sm font-bold">
              {formatDuration(serviceSeconds)}
            </span>
          </div>
        )}
        {isWaiting && onStartVisit && (
          <Button onClick={onStartVisit} className="gap-2">
            <Play className="h-4 w-4" />
            Начать прием
          </Button>
        )}
        {isEditable && (
          <Button onClick={onCompleteVisit}>Завершить прием</Button>
        )}
      </div>
    </div>
  );
};
