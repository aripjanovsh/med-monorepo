import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Hourglass, Timer, CheckCircle2 } from "lucide-react";
import { useGetDoctorQueueQuery } from "@/features/visit/visit.api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type CompletedVisitsListProps = {
  employeeId: string;
  date?: string;
};

const formatPatientName = (patient: {
  firstName: string;
  lastName: string;
  middleName?: string;
}) => {
  return [patient.lastName, patient.firstName, patient.middleName]
    .filter(Boolean)
    .join(" ");
};

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
};

export const CompletedVisitsList = ({
  employeeId,
  date,
}: CompletedVisitsListProps) => {
  const { data, isLoading } = useGetDoctorQueueQuery({
    employeeId,
    date,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.stats.completed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Завершённые приёмы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-4">
            Пока нет завершённых приёмов сегодня
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Завершённые приёмы
          </CardTitle>
          <Badge variant="secondary">{data.stats.completed}</Badge>
        </div>
        {/* Summary stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Hourglass className="h-3.5 w-3.5 text-amber-600" />
            <span>
              Ср. ожидание: {formatMinutes(data.stats.avgWaitingTime)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5 text-purple-600" />
            <span>Ср. приём: {formatMinutes(data.stats.avgServiceTime)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пациент</TableHead>
              <TableHead className="text-center">Время завершения</TableHead>
              <TableHead className="text-center">Ожидание</TableHead>
              <TableHead className="text-center">Приём</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.completed.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell className="font-medium">
                  {formatPatientName(visit.patient)}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(visit.completedAt), "HH:mm", {
                      locale: ru,
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-amber-600">
                    {formatMinutes(visit.waitingTimeMinutes)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-purple-600">
                    {formatMinutes(visit.serviceTimeMinutes)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
