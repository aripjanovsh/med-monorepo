"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

import {
  useGetVisitQuery,
  useCompleteVisitMutation,
  VisitStatusBadge,
  isVisitEditable,
  canCompleteVisit,
} from "@/features/visit";
import { getPatientFullName } from "@/features/patients/patient.model";
import { getEmployeeFullName } from "@/features/employees/employee.model";
import { PrescriptionList } from "@/features/prescription/components/prescription-list";
import { LoadingState, ErrorState } from "@/components/states";
import { useConfirmDialog } from "@/components/dialogs";
import { ROUTES, url } from "@/constants/route.constants";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function VisitDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirmDialog();
  const { data: visit, isLoading, error, refetch } = useGetVisitQuery(id);
  const [completeVisit] = useCompleteVisitMutation();

  const handleCompleteVisit = useCallback(() => {
    confirm({
      title: "Завершить прием?",
      description: "Вы уверены, что хотите завершить прием?",
      confirmText: "Завершить",
      onConfirm: async () => {
        try {
          await completeVisit({ id }).unwrap();
          toast.success("Прием успешно завершен");
          refetch();
        } catch (error: any) {
          console.error("Error completing visit:", error);
          const errorMessage =
            error?.data?.message ||
            error?.message ||
            "Ошибка при завершении приема";
          toast.error(errorMessage);
        }
      },
    });
  }, [confirm, id, completeVisit, refetch]);

  if (isLoading) {
    return <LoadingState title="Загрузка визита..." />;
  }

  if (error || !visit) {
    return (
      <ErrorState
        title="Визит не найден"
        description="Не удалось загрузить информацию о визите"
        onRetry={refetch}
        onBack={() => router.push(ROUTES.VISITS)}
        backLabel="Вернуться к списку визитов"
      />
    );
  }

  const editable = isVisitEditable(visit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.VISITS)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Детали визита</h1>
            <p className="text-muted-foreground">
              {format(new Date(visit.visitDate), "dd MMMM yyyy, HH:mm", {
                locale: ru,
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editable && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(url(ROUTES.VISIT_EDIT, { id }))}
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
              <Button onClick={handleCompleteVisit}>Завершить прием</Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="prescriptions">Назначения</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Информация о визите</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <VisitStatusBadge status={visit.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дата и время</p>
                  <p className="font-medium">
                    {format(new Date(visit.visitDate), "dd.MM.yyyy HH:mm", {
                      locale: ru,
                    })}
                  </p>
                </div>
              </div>

              {visit.patient && (
                <div>
                  <p className="text-sm text-muted-foreground">Пациент</p>
                  <p className="font-medium text-lg">
                    {getPatientFullName(visit.patient)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Дата рождения:{" "}
                    {format(new Date(visit.patient.dateOfBirth), "dd.MM.yyyy", {
                      locale: ru,
                    })}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Врач</p>
                <p className="font-medium">
                  {getEmployeeFullName(visit.employee)}
                </p>
              </div>

              {visit.protocol && (
                <div>
                  <p className="text-sm text-muted-foreground">Шаблон протокола</p>
                  <p className="font-medium">{visit.protocol.name}</p>
                </div>
              )}

              {visit.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Примечания</p>
                  <p className="whitespace-pre-wrap">{visit.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardContent className="pt-6">
              <PrescriptionList
                visitId={visit.id}
                status={visit.status}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
