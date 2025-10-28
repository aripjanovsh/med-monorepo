"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

import { useGetVisitQuery, useUpdateVisitStatusMutation } from "@/features/visit";
import { VisitStatusBadge } from "@/features/visit/components/visit-status-badge";
import { getPatientFullName, getEmployeeFullName } from "@/features/visit";
import { PrescriptionList } from "@/features/prescription/components/prescription-list";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function VisitDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: visit, isLoading } = useGetVisitQuery(id);
  const [updateStatus] = useUpdateVisitStatusMutation();

  const handleCompleteVisit = async () => {
    if (!confirm("Завершить прием?")) return;

    try {
      await updateStatus({ id, status: "COMPLETED" }).unwrap();
      toast.success("Прием завершен");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при завершении");
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!visit) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/cabinet/visits")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Визит не найден</h1>
        </div>
      </div>
    );
  }

  const isEditable = visit.status === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/cabinet/visits")}
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
          {isEditable && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/cabinet/visits/${id}/edit`)}
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

              <div>
                <p className="text-sm text-muted-foreground">Пациент</p>
                <p className="font-medium text-lg">{getPatientFullName(visit)}</p>
                <p className="text-sm text-muted-foreground">
                  Дата рождения:{" "}
                  {format(new Date(visit.patient.dateOfBirth), "dd.MM.yyyy", {
                    locale: ru,
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Врач</p>
                <p className="font-medium">{getEmployeeFullName(visit)}</p>
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
