import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useGetQueueDashboardQuery } from "../reception.api";
import { Skeleton } from "@/components/ui/skeleton";
import type { DoctorQueue, DoctorStatus } from "../types/queue-dashboard";
import { useState } from "react";

const statusConfig: Record<
  DoctorStatus,
  { label: string; color: string; bgColor: string }
> = {
  FREE: { label: "Свободен", color: "text-green-600", bgColor: "bg-green-100" },
  BUSY: { label: "Занят", color: "text-red-600", bgColor: "bg-red-100" },
  FINISHED: {
    label: "Закончил",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

const DoctorRow = ({ doctor }: { doctor: DoctorQueue }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fullName = [doctor.lastName, doctor.firstName, doctor.middleName]
    .filter(Boolean)
    .join(" ");

  const statusInfo = statusConfig[doctor.status];
  const totalPatients = doctor.stats.waiting + doctor.stats.completed;
  const progressPercent =
    totalPatients > 0 ? (doctor.stats.completed / totalPatients) * 100 : 0;

  return (
    <div className="border-b last:border-b-0">
      {/* Main Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 min-w-[90px]">
          <div className={`h-2.5 w-2.5 rounded-full ${statusInfo.bgColor}`} />
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Doctor Name */}
        <div className="min-w-[180px] flex-1">
          <div className="text-sm font-medium">{fullName}</div>
          <div className="text-xs text-muted-foreground">
            {doctor.stats.completed}/{totalPatients}
          </div>
        </div>

        {/* Queue Badge */}
        {doctor.stats.waiting > 0 && (
          <Badge variant="secondary" className="h-6 text-xs">
            <Users className="mr-1 h-3 w-3" />
            {doctor.stats.waiting}
          </Badge>
        )}

        {/* Current Patient */}
        {doctor.queue.length > 0 && doctor.queue[0] && (
          <div className="hidden min-w-[120px] text-xs md:block">
            <span className="text-muted-foreground">Первый: </span>
            <span>
              {[
                doctor.queue[0].patient.lastName,
                doctor.queue[0].patient.firstName?.charAt(0) + ".",
              ]
                .filter(Boolean)
                .join(" ")}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="hidden items-center gap-3 text-xs text-muted-foreground lg:flex">
          <div className="flex items-center gap-1" title="Ср. ожидание">
            <Clock className="h-3 w-3" />
            <span>{doctor.stats.avgWaitingTime}м</span>
          </div>
          <div className="flex items-center gap-1" title="Ср. приём">
            <Clock className="h-3 w-3" />
            <span>{doctor.stats.avgServiceTime}м</span>
          </div>
        </div>

        {/* Expand Icon */}
        {doctor.queue.length > 0 && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </button>

      {/* Expanded Queue */}
      {isExpanded && doctor.queue.length > 0 && (
        <div className="border-t bg-muted/30 p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Очередь ({doctor.queue.length})
          </div>
          <div className="space-y-1.5">
            {doctor.queue.map((visit) => {
              const patientName = [
                visit.patient.lastName,
                visit.patient.firstName,
                visit.patient.middleName,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={visit.id}
                  className="flex items-center justify-between rounded-md bg-background p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Badge
                      variant="outline"
                      className="h-5 w-5 justify-center p-0 text-xs"
                    >
                      {visit.queueNumber}
                    </Badge>
                    <span className="text-xs">{patientName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{visit.waitingMinutes}м</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DoctorsTodayBoard = ({ date }: { date?: string }) => {
  const { data, isLoading, error } = useGetQueueDashboardQuery(
    date ? { date } : undefined
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-12 w-full" />
              </div>
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
            Ошибка загрузки данных
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.doctors.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Нет активных врачей сегодня
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort doctors: BUSY first, then by queue length
  const sortedDoctors = [...data.doctors].sort((a, b) => {
    if (a.status === "BUSY" && b.status !== "BUSY") return -1;
    if (a.status !== "BUSY" && b.status === "BUSY") return 1;
    return b.stats.waiting - a.stats.waiting;
  });

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        {sortedDoctors.map((doctor) => (
          <DoctorRow key={doctor.id} doctor={doctor} />
        ))}
      </CardContent>
    </Card>
  );
};
