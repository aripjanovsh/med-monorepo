import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, CheckCircle } from "lucide-react";
import {
  useGetDoctorQueueQuery,
  useCompleteVisitMutation,
} from "@/features/visit/visit.api";
import { Skeleton } from "@/components/ui/skeleton";

type CurrentPatientCardProps = {
  employeeId: string;
  date?: string;
};

export const CurrentPatientCard = ({
  employeeId,
  date,
}: CurrentPatientCardProps) => {
  const { data, isLoading } = useGetDoctorQueueQuery({
    employeeId,
    date,
  });

  const [completeVisit, { isLoading: isCompleting }] =
    useCompleteVisitMutation();

  const handleComplete = async () => {
    if (!data?.inProgress) return;

    try {
      await completeVisit({
        id: data.inProgress.id,
        employeeId,
      }).unwrap();
    } catch (error) {
      console.error("Failed to complete visit:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.inProgress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Текущий приём</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Нет пациента на приёме
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Выберите пациента из очереди
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const patientName = [
    data.inProgress.patient.lastName,
    data.inProgress.patient.firstName,
    data.inProgress.patient.middleName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Текущий приём</CardTitle>
          <Badge>В процессе</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">{patientName}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Время ожидания: {data.inProgress.waitingMinutes} мин
                </span>
              </div>
              {data.inProgress.notes && (
                <p className="text-sm text-muted-foreground">
                  {data.inProgress.notes}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className="h-10 w-10 justify-center rounded-full p-0 text-lg font-bold"
            >
              {data.inProgress.queueNumber}
            </Badge>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {isCompleting ? "Завершение..." : "Завершить приём"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
