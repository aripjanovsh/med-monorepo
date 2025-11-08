"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceptionDashboard } from "@/features/reception/components/reception-dashboard";
import { DoctorDashboard } from "@/features/doctor/components/doctor-dashboard";

export default function DashboardPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Кабинет</h1>
        <p className="text-muted-foreground">
          Управление приёмами и очередью пациентов
        </p>
      </div>

      <Tabs defaultValue="reception" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reception">Регистратура</TabsTrigger>
          <TabsTrigger value="doctor">Панель врача</TabsTrigger>
        </TabsList>

        <TabsContent value="reception" className="mt-6">
          <ReceptionDashboard />
        </TabsContent>

        <TabsContent value="doctor" className="mt-6">
          <DoctorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
