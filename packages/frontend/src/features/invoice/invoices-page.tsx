"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Eye, Trash, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import {
  useGetInvoicesQuery,
  CreateInvoiceWithPaymentSheet,
  useDeleteInvoiceMutation,
  invoiceColumns,
  canAddPayment,
} from "@/features/invoice";
import type {
  InvoiceListItemDto,
  PaymentStatus,
} from "@/features/invoice/invoice.dto";
import { ROUTES, url } from "@/constants/route.constants";
import { ActionTabs } from "@/components/action-tabs";
import PageHeader from "@/components/layouts/page-header";
import { useConfirmDialog } from "@/components/dialogs";
import { useDialog } from "@/lib/dialog-manager";
import { useDataTableState } from "@/hooks/use-data-table-state";

export const InvoicesPage = () => {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const createInvoiceDialog = useDialog(CreateInvoiceWithPaymentSheet);
  const [activeTab, setActiveTab] = useState("all");

  // DataTable state management with built-in debounce
  const { queryParams, handlers, setters, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 300,
  });

  // Map activeTab to status filter
  const getStatusFilter = (tab: string): PaymentStatus | undefined => {
    switch (tab) {
      case "unpaid":
        return "UNPAID";
      case "partially_paid":
        return "PARTIALLY_PAID";
      case "paid":
        return "PAID";
      default:
        return undefined;
    }
  };

  // Reset to first page when activeTab changes
  useEffect(() => {
    setters.setPage(1);
  }, [activeTab, setters]);

  // Add status filter to query params
  const finalQueryParams = useMemo(() => {
    const status = getStatusFilter(activeTab);
    return {
      ...queryParams,
      ...(status && { status }),
    };
  }, [queryParams, activeTab]);

  // Fetch invoices with managed state
  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useGetInvoicesQuery(finalQueryParams);

  const [deleteInvoice] = useDeleteInvoiceMutation();

  const handleCreateInvoice = useCallback(() => {
    createInvoiceDialog.open({
      onSuccess: () => {
        createInvoiceDialog.close();
        toast.success("Счет успешно создан!");
        refetchInvoices();
      },
    });
  }, [createInvoiceDialog, refetchInvoices]);

  const handleDeleteInvoice = useCallback(
    async (invoice: InvoiceListItemDto) => {
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
    },
    [confirm, deleteInvoice, refetchInvoices]
  );

  const handleAddPayment = useCallback(
    (invoice: InvoiceListItemDto) => {
      router.push(url(ROUTES.INVOICE_DETAIL, { id: invoice.id }));
    },
    [router]
  );

  const invoices = invoicesData?.data || [];
  const totalInvoices = invoicesData?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Счета"
        actions={
          <Button onClick={handleCreateInvoice}>
            <Plus />
            Создать счет
          </Button>
        }
      />

      <ActionTabs
        value={activeTab}
        onValueChange={setActiveTab}
        items={[
          { value: "all", label: "Все счета" },
          { value: "unpaid", label: "Неоплаченные" },
          { value: "partially_paid", label: "Частично оплаченные" },
          { value: "paid", label: "Оплаченные" },
        ]}
      />

      <DataTable
        columns={[
          ...invoiceColumns,
          {
            id: "actions",
            cell: ({ row }) => {
              const invoice = row.original;

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Открыть меню</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          url(ROUTES.INVOICE_DETAIL, { id: invoice.id })
                        )
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Просмотр
                    </DropdownMenuItem>
                    {canAddPayment(invoice) && (
                      <DropdownMenuItem
                        onClick={() => handleAddPayment(invoice)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Добавить платеж
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteInvoice(invoice)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
        data={invoices}
        isLoading={isLoadingInvoices}
        pagination={{
          ...handlers.pagination,
          total: totalInvoices,
        }}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="invoiceNumber"
            searchPlaceholder="Поиск по номеру счета или имени пациента..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          invoicesError ? (
            <DataTableErrorState
              title="Ошибка при загрузке счетов"
              error={invoicesError}
              onRetry={refetchInvoices}
            />
          ) : (
            <DataTableEmptyState
              title="Счета не найдены"
              description="Попробуйте изменить параметры поиска или фильтры"
            />
          )
        }
        onRowClick={(row) => {
          router.push(url(ROUTES.INVOICE_DETAIL, { id: row.original.id }));
        }}
      />
    </div>
  );
};
