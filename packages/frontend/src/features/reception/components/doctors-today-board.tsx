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

  return (
    <div className="border-b last:border-b-0">
      {/* Main Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 p-2.5 text-left transition-colors hover:bg-muted/50"
        type="button"
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 min-w-[80px]">
          <div className={`h-2 w-2 rounded-full ${statusInfo.bgColor}`} />
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Doctor Name */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{fullName}</div>
          <div className="text-xs text-muted-foreground">
            {doctor.stats.completed}/{totalPatients}
          </div>
        </div>

        {/* Queue Badge */}
        {doctor.stats.waiting > 0 && (
          <Badge variant="secondary" className="h-6 text-xs shrink-0">
            <Users className="mr-1 h-3 w-3" />
            {doctor.stats.waiting}
          </Badge>
        )}

        {/* Expand Icon */}
        {doctor.queue.length > 0 && (
          <div className="shrink-0">
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
        <div className="border-t bg-muted/30 p-2">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground px-1">
            Очередь ({doctor.queue.length})
          </div>
          <div className="space-y-1">
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
                  className="flex items-center justify-between rounded-md bg-background p-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge
                      variant="outline"
                      className="h-5 w-5 justify-center p-0 text-xs shrink-0"
                    >
                      {visit.queueNumber}
                    </Badge>
                    <span className="text-xs truncate">{patientName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
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
      <div className="divide-y bg-card">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card p-6">
        <p className="text-center text-sm text-destructive">
          Ошибка загрузки данных
        </p>
      </div>
    );
  }

  if (!data || data.doctors.length === 0) {
    return (
      <div className="bg-card p-6">
        <p className="text-center text-sm text-muted-foreground">
          Нет активных врачей сегодня
        </p>
      </div>
    );
  }

  // Sort doctors: BUSY first, then by queue length
  const sortedDoctors = [...data.doctors].sort((a, b) => {
    if (a.status === "BUSY" && b.status !== "BUSY") return -1;
    if (a.status !== "BUSY" && b.status === "BUSY") return 1;
    return b.stats.waiting - a.stats.waiting;
  });

  return (
    <div className="divide-y bg-card">
      {sortedDoctors.map((doctor) => (
        <DoctorRow key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
};
