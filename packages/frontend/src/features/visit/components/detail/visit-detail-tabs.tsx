"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisitProtocol } from "@/features/visit";
import { PrescriptionList } from "@/features/prescription/components/prescription-list";
import { LabOrderList } from "@/features/lab-order/components/lab-order-list";
import { ServiceOrderList } from "@/features/service-order/components/service-order-list";
import { AddServicesDialog } from "@/features/service-order/components/add-services-dialog";
import { VisitParametersAllergiesTab } from "./visit-parameters-allergies-tab";
import type { VisitResponseDto } from "@/features/visit/visit.dto";
import type { FilledFormData } from "@/features/protocol-template";

type VisitDetailTabsProps = {
  visit: VisitResponseDto;
  isEditable: boolean;
};

export const VisitDetailTabs = ({ visit, isEditable }: VisitDetailTabsProps) => {
  const [addServicesOpen, setAddServicesOpen] = useState(false);

  return (
    <>
      <Tabs defaultValue="protocol" className="space-y-4">
        <TabsList>
          <TabsTrigger value="protocol">Протокол осмотра</TabsTrigger>
          <TabsTrigger value="parameters">Показатели и аллергии</TabsTrigger>
          <TabsTrigger value="services">Назначения и услуги</TabsTrigger>
          <TabsTrigger value="prescriptions">Рецепты</TabsTrigger>
          <TabsTrigger value="lab">Направление на анализы</TabsTrigger>
        </TabsList>

        <TabsContent value="protocol" className="space-y-4">
          <VisitProtocol
            visitId={visit.id}
            initialProtocolId={visit.protocol?.id}
            initialProtocolData={
              visit.protocolData
                ? (JSON.parse(visit.protocolData) as FilledFormData)
                : {}
            }
            status={visit.status}
          />
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <VisitParametersAllergiesTab
            patientId={visit.patient.id}
            visitId={visit.id}
            employeeId={visit.employee.id}
            isEditable={isEditable}
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
    </>
  );
};
