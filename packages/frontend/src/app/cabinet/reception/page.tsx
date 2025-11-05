"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import {
  ReceptionStats,
  QuickCreateVisitModal,
  DoctorsTodayBoard,
  CompletedVisitsPanel,
} from "@/features/reception";
import { CreateInvoiceWithPaymentSheet } from "@/features/invoice/components/create-invoice-with-payment-sheet";
import { useGetMeQuery } from "@/features/auth";

export default function ReceptionDashboardPage() {
  const [showCreateVisit, setShowCreateVisit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Используем Dialog Manager для invoice sheet
  const invoiceDialog = useDialog(CreateInvoiceWithPaymentSheet);

  // Get current user
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ресепшн</h1>
          <p className="text-sm text-muted-foreground">
            Управление очередью и визитами
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            title="Обновить"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={() => setShowCreateVisit(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Быстрый визит
          </Button>
        </div>
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
            onCreateInvoice={(visit) => {
              invoiceDialog.open({
                visitData: visit,
                onSuccess: () => {
                  console.log("✅ Invoice paid successfully");
                  invoiceDialog.close();
                },
              });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Create Visit Modal */}
      <QuickCreateVisitModal
        open={showCreateVisit}
        onOpenChange={setShowCreateVisit}
        onSuccess={() => {
          console.log("✅ Visit created successfully");
        }}
      />
    </div>
  );
}
