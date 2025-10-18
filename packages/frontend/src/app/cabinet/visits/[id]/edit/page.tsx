"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

import { useGetVisitQuery } from "@/features/visit";
import { VisitForm } from "@/features/visit/components/visit-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditVisitPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: visit, isLoading } = useGetVisitQuery(id);

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

  if (visit.status !== "IN_PROGRESS") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/cabinet/visits/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Редактирование недоступно</h1>
            <p className="text-muted-foreground">
              Можно редактировать только визиты со статусом "В процессе"
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/cabinet/visits/${id}`)}>
          Вернуться к визиту
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/cabinet/visits/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Редактировать визит</h1>
          <p className="text-muted-foreground">Обновление информации о визите</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о визите</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitForm
            mode="edit"
            initialData={{
              id: visit.id,
              patientId: visit.patient.id,
              employeeId: visit.employee.id,
              visitDate: visit.visitDate.split('T')[0], // Convert ISO to yyyy-MM-dd for DatePickerField
              notes: visit.notes || "",
            }}
            onSuccess={() => router.push(`/cabinet/visits/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
