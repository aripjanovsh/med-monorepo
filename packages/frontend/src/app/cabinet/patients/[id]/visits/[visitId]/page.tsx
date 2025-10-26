"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Stethoscope, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

import {
  useGetVisitQuery,
  useUpdateVisitStatusMutation,
  VisitProtocol,
} from "@/features/visit";
import { VisitStatusBadge } from "@/features/visit/components/visit-status-badge";
import { getPatientFullName, getEmployeeFullName } from "@/features/visit";
import { PrescriptionList } from "@/features/prescription/components/prescription-list";
import { LabOrderList } from "@/features/lab-order/components/lab-order-list";
import { ServiceOrderList } from "@/features/service-order/components/service-order-list";
import { AddServicesDialog } from "@/features/service-order/components/add-services-dialog";
import type { FilledFormData } from "@/features/protocol-template";

type PageProps = {
  params: Promise<{ id: string; visitId: string }>;
};

export default function PatientVisitDetailPage({ params }: PageProps) {
  const { id: patientId, visitId } = use(params);
  const router = useRouter();
  const { data: visit, isLoading } = useGetVisitQuery(visitId);
  const [updateStatus] = useUpdateVisitStatusMutation();
  const [addServicesOpen, setAddServicesOpen] = useState(false);

  const handleCompleteVisit = async () => {
    if (!confirm("Завершить прием?")) return;

    try {
      await updateStatus({ id: visitId, status: "COMPLETED" }).unwrap();
      toast.success("Прием завершен");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при завершении");
    }
  };

  if (isLoading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (!visit) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/cabinet/patients/${patientId}`)}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Детали приема</h1>
            <p className="text-muted-foreground">
              {format(new Date(visit.visitDate), "dd MMMM yyyy, HH:mm", {
                locale: ru,
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <VisitStatusBadge status={visit.status} />
          {isEditable && (
            <Button onClick={handleCompleteVisit}>Завершить прием</Button>
          )}
        </div>
      </div>

      {/* Patient and Doctor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Пациент
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-semibold">
                {getPatientFullName(visit)}
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Дата рождения:{" "}
                  {format(new Date(visit.patient.dateOfBirth), "dd.MM.yyyy", {
                    locale: ru,
                  })}
                </p>
                <p>Пол: {visit.patient.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5" />
              Врач
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-semibold">
                {getEmployeeFullName(visit)}
              </p>
              {visit.employee.employeeId && (
                <p className="text-sm text-muted-foreground">
                  ID: {visit.employee.employeeId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Notes */}
      {visit.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Примечания к приему
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{visit.notes}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="protocol" className="space-y-4">
        <TabsList>
          <TabsTrigger value="protocol">Протокол осмотра</TabsTrigger>
          <TabsTrigger value="services">Назначения и услуги</TabsTrigger>
          <TabsTrigger value="prescriptions">Рецепты</TabsTrigger>
          <TabsTrigger value="lab">Направление на анализы</TabsTrigger>
        </TabsList>

        <TabsContent value="protocol" className="space-y-4">
          <VisitProtocol
            visitId={visit.id}
            initialProtocolId={visit.protocol?.id}
            initialProtocolData={
              visit.protocolData ? (JSON.parse(visit.protocolData) as FilledFormData) : {}
            }
            status={visit.status}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ServiceOrderList
                visitId={visit.id}
                onAddServices={() => setAddServicesOpen(true)}
                isEditable={isEditable}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <PrescriptionList
                visitId={visit.id}
                employeeId={visit.employee.id}
                status={visit.status}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <LabOrderList
                visitId={visit.id}
                employeeId={visit.employee.id}
                status={visit.status}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Services Dialog */}
      <AddServicesDialog
        open={addServicesOpen}
        onOpenChange={setAddServicesOpen}
        visitId={visit.id}
        patientId={visit.patient.id}
        doctorId={visit.employee.id}
      />
    </div>
  );
}
