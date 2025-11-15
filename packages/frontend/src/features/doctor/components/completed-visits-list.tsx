import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { useGetDoctorQueueQuery } from "@/features/visit/visit.api";
import { Skeleton } from "@/components/ui/skeleton";

type CompletedVisitsListProps = {
  employeeId: string;
  date?: string;
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
          <CardTitle>Завершённые приёмы</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
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
          <CardTitle>Завершённые приёмы</CardTitle>
          <Badge variant="secondary">{data.stats.completed}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Сегодня завершено</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Ср. ожидание: {data.stats.avgWaitingTime} мин</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Ср. приём: {data.stats.avgServiceTime} мин</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">{data.stats.completed}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
