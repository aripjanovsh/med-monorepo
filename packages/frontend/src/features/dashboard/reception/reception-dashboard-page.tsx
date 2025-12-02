"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { useGetMeQuery } from "@/features/auth";
import { CompletedVisitsPanel } from "@/features/dashboard/reception";
import { CreateInvoiceWithPaymentSheet } from "@/features/invoice/components/create-invoice-with-payment-sheet";
import { QueueWidget } from "@/features/dashboard/reception/widgets/queue-widget";
import { InProgressWidget } from "@/features/dashboard/reception/widgets/in-progress-widget";
import { QuickActionsWidget } from "@/features/dashboard/reception/widgets/quick-actions-widget";
import { QuickCreateVisitModal } from "@/features/visit/components/quick-create-visit-modal";

export const ReceptionDashboardPage = () => {
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

  return (
    <div className="space-y-6">
      {/* Quick Actions Panel */}
      <QuickActionsWidget
        onCreateVisit={handleCreateVisit}
        onCreatePatient={handleCreatePatient}
        onCreateAppointment={handleCreateAppointment}
        onCreateInvoice={() => handleCreateInvoice(null)}
        onViewPatients={handleViewPatients}
        onViewReports={handleViewReports}
      />

      {/* Main Content - 3 Column Layout */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Column 1 - Active Queue */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold">
                Активная очередь
              </h2>
            </div>
            <QueueWidget />
          </div>
        </div>

        {/* Column 2 - In Progress */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold">На приёме</h2>
            </div>
            <InProgressWidget />
          </div>
        </div>

        {/* Column 3 - Completed Visits */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold">
                Завершенные приёмы
              </h2>
            </div>
            <CompletedVisitsPanel onCreateInvoice={handleCreateInvoice} />
          </div>
        </div>
      </div>
    </div>
  );
};
