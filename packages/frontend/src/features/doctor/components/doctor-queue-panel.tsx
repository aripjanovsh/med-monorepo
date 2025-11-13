import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, PlayCircle, CheckCircle } from "lucide-react";
import {
  useGetDoctorQueueQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
} from "../api/doctor.api";
import { Skeleton } from "@/components/ui/skeleton";
import type { DoctorQueueVisit } from "../types/doctor-queue";

type DoctorQueuePanelProps = {
  employeeId: string;
  date?: string;
};

const QueueItem = ({
  visit,
  isInProgress,
  onStart,
  onComplete,
}: {
  visit: DoctorQueueVisit;
  isInProgress?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}) => {
  const patientName = [
    visit.patient.lastName,
    visit.patient.firstName,
    visit.patient.middleName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 ${
        isInProgress ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Badge
          variant={isInProgress ? "default" : "outline"}
          className="h-8 w-8 justify-center rounded-full p-0 text-base font-bold"
        >
          {visit.queueNumber}
        </Badge>
        <div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{patientName}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Ожидает: {visit.waitingMinutes} мин</span>
          </div>
          {visit.notes && (
            <p className="mt-1 text-sm text-muted-foreground">{visit.notes}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {!isInProgress && onStart && (
          <Button size="sm" onClick={onStart}>
            <PlayCircle className="mr-1 h-4 w-4" />
            Начать
          </Button>
        )}
        {isInProgress && onComplete && (
          <Button size="sm" variant="default" onClick={onComplete}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Завершить
          </Button>
        )}
      </div>
    </div>
  );
};

export const DoctorQueuePanel = ({
  employeeId,
  date,
}: DoctorQueuePanelProps) => {
  const { data, isLoading, error } = useGetDoctorQueueQuery({
    employeeId,
    date,
  });

  const [startVisit, { isLoading: isStarting }] = useStartVisitMutation();

  const handleStart = async (visitId: string) => {
    try {
      await startVisit({ visitId }).unwrap();
    } catch (error) {
      console.error("Failed to start visit:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Очередь пациентов ({data.waiting.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {data.waiting.length > 0 ? (
          <div className="space-y-2">
            {data.waiting.map((visit) => (
              <QueueItem
                key={visit.id}
                visit={visit}
                onStart={() => handleStart(visit.id)}
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
  );
};
