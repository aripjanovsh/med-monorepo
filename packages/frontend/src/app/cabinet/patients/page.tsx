"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/lib/dialog-manager";
import { Edit, Eye, MoreHorizontal, Plus, Trash, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ActionTabs } from "@/components/action-tabs";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import { patientColumns } from "@/features/patients/components/patient-columns";
import {
  type PatientResponseDto,
  type PatientStatusDto,
  useGetPatientsQuery,
  useDeletePatientMutation,
  PatientFormSheet,
} from "@/features/patients";
import PageHeader from "@/components/layouts/page-header";
import { useConfirmDialog } from "@/components/dialogs";
import { useDataTableState } from "@/hooks/use-data-table-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function PatientsPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const patientFormSheet = useDialog(PatientFormSheet);
  const [activeTab, setActiveTab] = useState("active");

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "firstName", desc: false }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Map activeTab to status filter
  const getStatusFilter = (tab: string): PatientStatusDto => {
    switch (tab) {
      case "active":
        return "ACTIVE";
      case "inactive":
        return "INACTIVE";
      case "deceased":
        return "DECEASED";
      default:
        return "ACTIVE";
    }
  };

  // Reset to first page when activeTab changes
  useEffect(() => {
    handlers.pagination.onChangePage(1);
  }, [activeTab]);

  // Add status filter to query params
  const finalQueryParams = useMemo(() => {
    const status = getStatusFilter(activeTab);
    return {
      ...queryParams,
      status,
    };
  }, [queryParams, activeTab]);

  // Fetch patients with managed state
  const {
    data: patientsData,
    isLoading: isLoadingPatients,
    error: patientsError,
    refetch: refetchPatients,
  } = useGetPatientsQuery(finalQueryParams);

  const [deletePatient] = useDeletePatientMutation();

  const handleCreatePatient = () => {
    patientFormSheet.open({
      mode: "create",
      patientId: null,
      onSuccess: () => {
        refetchPatients();
      },
    });
  };

  const handleEditPatient = (patient: PatientResponseDto) => {
    patientFormSheet.open({
      mode: "edit",
      patientId: patient.id,
      onSuccess: () => {
        refetchPatients();
      },
    });
  };

  const handleDeletePatient = useCallback(
    async (patient: PatientResponseDto) => {
      confirm({
        title: "Удалить пациента?",
        description: `Вы уверены, что хотите удалить пациента ${patient.firstName} ${patient.lastName}? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deletePatient({ id: patient.id }).unwrap();
            toast.success("Пациент успешно удален!");
            refetchPatients();
          } catch (error: any) {
            console.error("Error deleting patient:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении пациента";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deletePatient, refetchPatients]
  );

  const patients = patientsData?.data || [];
  const totalPatients = patientsData?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Пациенты"
        actions={
          <Button onClick={handleCreatePatient}>
            <Plus />
            Добавить пациента
          </Button>
        }
      />

      <ActionTabs
        value={activeTab}
        onValueChange={setActiveTab}
        items={[
          {
            value: "active",
            label: `Активные пациенты`,
          },
          {
            value: "inactive",
            label: `Неактивные`,
          },
        ]}
      />

      <DataTable
        columns={[
          ...patientColumns,
          {
            id: "actions",
            cell: ({ row }) => {
              const patient = row.original;

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Открыть меню</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/cabinet/patients/${patient.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Просмотр
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditPatient(patient);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeletePatient(patient);
                      }}
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
        data={patients}
        isLoading={isLoadingPatients}
        pagination={{
          ...handlers.pagination,
          total: totalPatients,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="firstName"
            searchPlaceholder="Поиск по имени пациента..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          patientsError ? (
            <DataTableErrorState
              title="Ошибка при загрузке пациентов"
              error={patientsError}
              onRetry={refetchPatients}
            />
          ) : (
            <DataTableEmptyState
              title={
                activeTab === "active"
                  ? "Активных пациентов пока нет"
                  : activeTab === "inactive"
                    ? "Неактивных пациентов нет"
                    : "Нет записей об умерших пациентах"
              }
              description="Добавьте первого пациента для начала работы"
              icon={UserPlus}
              action={
                <Button onClick={handleCreatePatient}>
                  <Plus />
                  Добавить пациента
                </Button>
              }
            />
          )
        }
        onRowClick={(row) => {
          router.push(`/cabinet/patients/${row.original.id}`);
        }}
      />
    </div>
  );
}
