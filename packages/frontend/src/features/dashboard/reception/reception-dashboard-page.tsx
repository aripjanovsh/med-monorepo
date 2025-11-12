"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { useGetMeQuery } from "@/features/auth";
import { QuickCreateVisitModal, DoctorsTodayBoard, CompletedVisitsPanel } from "@/features/reception";
import { CreateInvoiceWithPaymentSheet } from "@/features/invoice/components/create-invoice-with-payment-sheet";
import { StatsWidget } from "./widgets/stats-widget";
import { QueueWidget } from "./widgets/queue-widget";
import { QuickSearchWidget } from "./widgets/quick-search-widget";
import { QuickActionsWidget } from "./widgets/quick-actions-widget";
import { CalendarWidget } from "./widgets/calendar-widget";

export const ReceptionDashboardPage = () => {
  const [selectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const router = useRouter();

  const createVisitDialog = useDialog(QuickCreateVisitModal);
  const invoiceDialog = useDialog(CreateInvoiceWithPaymentSheet);
  const { data: currentUser, isLoading: isLoadingUser } = useGetMeQuery();

  const handleCreateVisit = useCallback(() => {
    createVisitDialog.open({
      onSuccess: () => {
        console.log("✅ Visit created successfully");
      },
    });
  }, [createVisitDialog]);

  const handleCreateInvoice = useCallback(
    (visit: any) => {
      invoiceDialog.open({
        visitData: visit,
        onSuccess: () => {
          console.log("✅ Invoice paid successfully");
          invoiceDialog.close();
        },
      });
    },
    [invoiceDialog]
  );

  const handlePatientSelect = useCallback(
    (patientId: string) => {
      router.push(`/cabinet/patients/${patientId}`);
    },
    [router]
  );

  const handleCreatePatient = useCallback(() => {
    router.push("/cabinet/patients/new");
  }, [router]);

  const handleCreateAppointment = useCallback(() => {
    router.push("/cabinet/appointments/new");
  }, [router]);

  const handleViewPatients = useCallback(() => {
    router.push("/cabinet/patients");
  }, [router]);

  const handleViewReports = useCallback(() => {
    router.push("/cabinet/reports");
  }, [router]);

  if (isLoadingUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!currentUser?.organizationId) {
    return (
      <div className="rounded-lg border border-destructive/50 p-3 text-center">
        <p className="text-sm text-destructive">
          Ошибка: отсутствует организация пользователя
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickSearchWidget onPatientSelect={handlePatientSelect} />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            title="Обновить"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={handleCreateVisit}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Быстрый визит
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsWidget date={selectedDate} />

      {/* Quick Actions Panel */}
      <QuickActionsWidget
        onCreateVisit={handleCreateVisit}
        onCreatePatient={handleCreatePatient}
        onCreateAppointment={handleCreateAppointment}
        onCreateInvoice={() => handleCreateInvoice(null)}
        onViewPatients={handleViewPatients}
        onViewReports={handleViewReports}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Calendar and Tabs */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Расписание</TabsTrigger>
              <TabsTrigger value="doctors">Врачи</TabsTrigger>
              <TabsTrigger value="completed">Оплата</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-4">
              <CalendarWidget />
            </TabsContent>

            <TabsContent value="doctors" className="mt-4">
              <DoctorsTodayBoard date={selectedDate} />
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <CompletedVisitsPanel
                organizationId={currentUser.organizationId}
                onCreateInvoice={handleCreateInvoice}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Live Queue */}
        <div className="lg:col-span-1">
          <QueueWidget />
        </div>
      </div>
    </div>
  );
};
