"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, PlayCircle, CheckCircle, SkipForward } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDepartmentQueueQuery,
  useStartServiceMutation,
  useCompleteServiceMutation,
  useSkipPatientMutation,
} from "../api/department-queue.api";
import type { QueueItem } from "../types/department-queue";

type DepartmentQueuePanelProps = {
  departmentId: string;
  departmentName: string;
  organizationId: string;
};

const QueueItemRow = ({
  item,
  isInProgress,
  organizationId,
  onStart,
  onComplete,
  onSkip,
}: {
  item: QueueItem;
  isInProgress?: boolean;
  organizationId: string;
  onStart?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}) => {
  const patientName = [
    item.patient.lastName,
    item.patient.firstName,
    item.patient.middleName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${
        isInProgress ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <Badge
          variant="outline"
          className="h-10 w-10 justify-center rounded-full p-0 text-lg font-bold"
        >
          {item.queueNumber}
        </Badge>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{patientName}</span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {item.service.name}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Ожидание: {item.waitingMinutes} мин</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isInProgress && onStart && (
          <>
            <Button size="sm" onClick={onStart}>
              <PlayCircle className="mr-1 h-4 w-4" />
              Начать
            </Button>
            {onSkip && (
              <Button size="sm" variant="outline" onClick={onSkip}>
                <SkipForward className="mr-1 h-4 w-4" />
                Пропустить
              </Button>
            )}
          </>
        )}
        {isInProgress && onComplete && (
          <Button size="sm" onClick={onComplete}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Завершить
          </Button>
        )}
      </div>
    </div>
  );
};

export const DepartmentQueuePanel = ({
  departmentId,
  departmentName,
  organizationId,
}: DepartmentQueuePanelProps) => {
  const { data, isLoading, error } = useGetDepartmentQueueQuery({
    departmentId,
    organizationId,
  });

  const [startService] = useStartServiceMutation();
  const [completeService] = useCompleteServiceMutation();
  const [skipPatient] = useSkipPatientMutation();

  const handleStart = async (serviceOrderId: string) => {
    try {
      await startService({ serviceOrderId, organizationId }).unwrap();
    } catch (error) {
      console.error("Failed to start service:", error);
    }
  };

  const handleComplete = async (serviceOrderId: string) => {
    try {
      await completeService({ serviceOrderId, organizationId }).unwrap();
    } catch (error) {
      console.error("Failed to complete service:", error);
    }
  };

  const handleSkip = async (serviceOrderId: string) => {
    try {
      await skipPatient({ serviceOrderId, organizationId }).unwrap();
    } catch (error) {
      console.error("Failed to skip patient:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-destructive">
            Ошибка загрузки очереди
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">В очереди</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.waiting}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">На приёме</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Пропущено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.skipped}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Patient */}
      {data.inProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Текущий пациент</CardTitle>
          </CardHeader>
          <CardContent>
            <QueueItemRow
              item={data.inProgress}
              isInProgress
              organizationId={organizationId}
              onComplete={() => handleComplete(data.inProgress!.id)}
            />
          </CardContent>
        </Card>
      )}

      {/* Waiting Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Очередь ({data.waiting.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data.waiting.length > 0 ? (
            <div className="space-y-3">
              {data.waiting.map((item) => (
                <QueueItemRow
                  key={item.id}
                  item={item}
                  organizationId={organizationId}
                  onStart={() => handleStart(item.id)}
                  onSkip={() => handleSkip(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Очередь пуста
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skipped Patients */}
      {data.skipped.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Пропущенные ({data.skipped.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.skipped.map((item) => (
                <QueueItemRow
                  key={item.id}
                  item={item}
                  organizationId={organizationId}
                  onStart={() => handleStart(item.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
