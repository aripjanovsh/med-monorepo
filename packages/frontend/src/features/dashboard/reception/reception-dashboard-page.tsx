"use client";

import { useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { useGetMeQuery } from "@/features/auth";
import { CreateInvoiceWithPaymentSheet } from "@/features/invoice/components/create-invoice-with-payment-sheet";
import { QuickActionsToolbar } from "@/features/dashboard/reception/widgets/quick-actions-toolbar";
import { TodayStatsWidget } from "@/features/dashboard/reception/widgets/today-stats-widget";
import { TodayAppointmentsWidget } from "@/features/dashboard/reception/widgets/today-appointments-widget";
import { VisitsTableWidget } from "@/features/dashboard/reception/widgets/visits-table-widget";
import { VisitFormDialog } from "@/features/visit";
import { PatientFormSheet } from "@/features/patients";
import { AppointmentFormSheet } from "@/features/appointment";
import {
  DashboardContent,
  DashboardProvider,
  DashboardTrigger,
} from "@/components/dashboard/dashboard-configurator";

export const ReceptionDashboardPage = () => {
  const createVisitDialog = useDialog(VisitFormDialog);
  const createPatientDialog = useDialog(PatientFormSheet);
  const createAppointmentDialog = useDialog(AppointmentFormSheet);
  const invoiceDialog = useDialog(CreateInvoiceWithPaymentSheet);
  const { isLoading: isLoadingUser } = useGetMeQuery();

  const handleCreateVisit = useCallback(() => {
    createVisitDialog.open({
      mode: "create",
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

  const handleCreatePatient = useCallback(() => {
    createPatientDialog.open({
      mode: "create",
      onSuccess: () => {
        console.log("✅ Patient created successfully");
      },
    });
  }, [createPatientDialog]);

  const handleCreateAppointment = useCallback(() => {
    createAppointmentDialog.open({
      mode: "create",
      onSuccess: () => {
        console.log("✅ Appointment created successfully");
      },
    });
  }, [createAppointmentDialog]);

  if (isLoadingUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <DashboardProvider
      storageKey="reception-dashboard-settings"
      widgets={[
        {
          id: "stats",
          label: "Статистика",
          component: <TodayStatsWidget />,
        },
        {
          id: "appointments",
          label: "Записи на сегодня",
          component: <TodayAppointmentsWidget />,
        },
        {
          id: "visits",
          label: "Визиты за сегодня",
          component: (
            <VisitsTableWidget onCreateInvoice={handleCreateInvoice} />
          ),
        },
      ]}
    >
      <div className="space-y-5">
        {/* Header: Quick Actions Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">Сегодня</h2>
          <div className="flex items-center gap-2">
            <QuickActionsToolbar
              onCreateVisit={handleCreateVisit}
              onCreatePatient={handleCreatePatient}
              onCreateAppointment={handleCreateAppointment}
              onCreateInvoice={() => handleCreateInvoice(null)}
            />

            <DashboardTrigger />
          </div>
        </div>

        <DashboardContent className="space-y-5" />
      </div>
    </DashboardProvider>
  );
};
