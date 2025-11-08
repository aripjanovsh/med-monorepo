"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import {
  ReceptionStats,
  DoctorsTodayBoard,
  CompletedVisitsPanel,
} from "@/features/reception";
import { QuickCreateVisitModal } from "@/features/reception";
import { CreateInvoiceWithPaymentSheet } from "@/features/invoice/components/create-invoice-with-payment-sheet";
import { useGetMeQuery } from "@/features/auth";

export const ReceptionDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const createVisitDialog = useDialog(QuickCreateVisitModal);
  const invoiceDialog = useDialog(CreateInvoiceWithPaymentSheet);
  const { data: currentUser, isLoading: isLoadingUser } = useGetMeQuery();

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

  return (
    <div className="space-y-4">
      {/* Header Actions */}
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

      {/* Stats Cards */}
      <ReceptionStats date={selectedDate} />

      {/* Tabs for content organization */}
      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="doctors">Врачи сегодня</TabsTrigger>
          <TabsTrigger value="completed">Требуют оплаты</TabsTrigger>
        </TabsList>

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
  );
};
