import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, CheckCircle, TrendingUp } from "lucide-react";
import type { DoctorQueueStats } from "../types/doctor-queue";

type DoctorStatsCardProps = {
  stats: DoctorQueueStats;
};

export const DoctorStatsCard = ({ stats }: DoctorStatsCardProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">В очереди</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.waiting}</div>
          <p className="text-xs text-muted-foreground">
            Пациентов ожидают приёма
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Завершено</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            Приёмов завершено сегодня
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ср. ожидание</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgWaitingTime} мин</div>
          <p className="text-xs text-muted-foreground">
            Среднее время ожидания
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ср. приём</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgServiceTime} мин</div>
          <p className="text-xs text-muted-foreground">Среднее время приёма</p>
        </CardContent>
      </Card>
    </div>
  );
};
