"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionTabs } from "@/components/action-tabs";
import { DataTable } from "@/components/data-table/data-table";
import PageHeader from "@/components/layouts/page-header";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/dialogs";
import {
  useGetInvoicesQuery,
  CreateInvoiceWithPaymentSheet,
  useDeleteInvoiceMutation,
  createInvoiceColumns,
  PAYMENT_STATUS,
  PAYMENT_STATUS_MAP,
} from "@/features/invoice";
import type {
  InvoiceListItemDto,
  InvoiceResponseDto,
} from "@/features/invoice/invoice.dto";
import type {
  FindAllInvoicesQueryDto,
  PaymentStatus,
} from "@/features/invoice/invoice.dto";
import { FilterSheet, ActiveFilters, type InvoiceFilters } from "@/components/filters";

export default function InvoicesPage(): ReactElement {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("doctors");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>({});

  const confirm = useConfirmDialog();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const queryParams: FindAllInvoicesQueryDto = {
    page,
    limit,
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(filters.dateFrom && { dateFrom: filters.dateFrom.toISOString().split('T')[0] }),
    ...(filters.dateTo && { dateTo: filters.dateTo.toISOString().split('T')[0] }),
  };

  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useGetInvoicesQuery(queryParams);

  const [deleteInvoice] = useDeleteInvoiceMutation();

  const handleCreateInvoice = () => {
    setShowCreateSheet(true);
  };

  const handleDeleteInvoice = async (invoice: InvoiceResponseDto) => {
    confirm({
      title: "Удалить счет?",
      description: `Вы уверены, что хотите удалить счет ${invoice.invoiceNumber}? Это действие нельзя отменить.`,
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: async () => {
        try {
          await deleteInvoice(invoice.id).unwrap();
          toast.success("Счет успешно удален!");
          refetchInvoices();
        } catch (error: any) {
          console.error("Error deleting invoice:", error);
          const errorMessage =
            error?.data?.message ||
            error?.message ||
            "Ошибка при удалении счета";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleAddPayment = (invoice: InvoiceListItemDto) => {
    router.push(getInvoiceDetailRoute(invoice.id));
  };

  const invoiceActions = {
    onDelete: handleDeleteInvoice,
    onAddPayment: handleAddPayment,
  };

  const invoiceColumns = createInvoiceColumns(invoiceActions);

  const invoices = invoicesData?.data || [];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: InvoiceFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleFilterRemove = (key: keyof InvoiceFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Счета"
        actions={
          <Button onClick={handleCreateInvoice}>
            <Plus className="mr-2 h-4 w-4" />
            Создать счет
          </Button>
        }
      />

      <ActionTabs
        value={activeTab}
        onValueChange={handleTabChange}
        items={[
          { value: "doctors", label: "Врачи" },
          { value: "nurses", label: "Сестры" },
          { value: "general", label: "Обслуживание" },
        ]}
      />

      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Input
                placeholder="Поиск по номеру счета или имени пациента..."
                className="w-full max-w-md"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              <ActiveFilters
                filters={filters}
                onFilterRemove={handleFilterRemove}
              />
            </div>
            <div className="flex items-center space-x-2">
              <FilterSheet
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {isLoadingInvoices ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : invoicesError ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500">Ошибка при загрузке данных</p>
                <Button
                  onClick={() => refetchInvoices()}
                  variant="outline"
                  className="mt-2"
                >
                  Повторить
                </Button>
              </div>
            </div>
          ) : invoices.length > 0 ? (
            <DataTable
              columns={invoiceColumns}
              data={invoices}
              pagination={{
                page,
                limit,
                total: invoicesData?.meta?.total || 0,
                onChangePage: setPage,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Нет счетов
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {debouncedSearchTerm
                    ? "Счета не найдены по вашему запросу."
                    : "Счета не найдены. Создайте новый счет."}
                </p>
                {!debouncedSearchTerm && (
                  <div className="mt-6">
                    <Button size="sm" onClick={handleCreateInvoice}>
                      <Plus className="mr-2 h-4 w-4" />
                      Создать счет
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      <CreateInvoiceWithPaymentSheet
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
        onSuccess={() => {
          refetchInvoices();
        }}
      />
    </div>
  );
}
