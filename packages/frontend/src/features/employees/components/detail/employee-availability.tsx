"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash,
  Calendar,
  Palmtree,
  PlusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  DataTable,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import { useConfirmDialog } from "@/components/dialogs";
import { useDialog } from "@/lib/dialog-manager";
import { useDataTableState } from "@/hooks/use-data-table-state";

// Employee Availability feature
import {
  useGetEmployeeAvailabilitiesQuery,
  useDeleteEmployeeAvailabilityMutation,
  employeeAvailabilityColumns,
  EmployeeAvailabilityForm,
  type EmployeeAvailabilityDto,
} from "@/features/employee-availability";

// Employee Leave Days feature
import {
  useGetEmployeeLeaveDaysQuery,
  useDeleteEmployeeLeaveDaysMutation,
  employeeLeaveDaysColumns,
  EmployeeLeaveDaysForm,
  type EmployeeLeaveDaysDto,
} from "@/features/employee-leave-days";

import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import PageHeader from "@/components/layouts/page-header";

type EmployeeAvailabilityProps = {
  employee: EmployeeResponseDto;
};

export const EmployeeAvailability = ({
  employee,
}: EmployeeAvailabilityProps) => {
  const { id: employeeId } = employee;
  const confirm = useConfirmDialog();
  const availabilityFormDialog = useDialog(EmployeeAvailabilityForm);
  const leaveDaysFormDialog = useDialog(EmployeeLeaveDaysForm);

  // DataTable state management for availability
  const availabilityState = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [
      {
        desc: false,
        id: "dayOfWeek",
      },
    ],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // DataTable state management for leave days
  const leaveDaysState = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [
      {
        desc: false,
        id: "startDate",
      },
    ],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  const {
    data: availabilityResponse,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useGetEmployeeAvailabilitiesQuery({
    employeeId,
    ...availabilityState.queryParams,
  });

  const {
    data: leaveDaysResponse,
    isLoading: isLoadingLeaveDays,
    error: leaveDaysError,
    refetch: refetchLeaveDays,
  } = useGetEmployeeLeaveDaysQuery({
    employeeId,
    ...leaveDaysState.queryParams,
  });

  const [deleteAvailability] = useDeleteEmployeeAvailabilityMutation();
  const [deleteLeaveDays] = useDeleteEmployeeLeaveDaysMutation();

  const availabilities = availabilityResponse?.data || [];
  const totalAvailabilities = availabilityResponse?.meta?.total || 0;
  const leaveDays = leaveDaysResponse?.data || [];
  const totalLeaveDays = leaveDaysResponse?.meta?.total || 0;

  const handleCreateAvailability = useCallback(() => {
    availabilityFormDialog.open({
      employeeId,
      onSuccess: () => refetchAvailability(),
    });
  }, [availabilityFormDialog, employeeId, refetchAvailability]);

  const handleEditAvailability = useCallback(
    (item: EmployeeAvailabilityDto) => {
      availabilityFormDialog.open({
        employeeId,
        availability: item,
        onSuccess: () => refetchAvailability(),
      });
    },
    [availabilityFormDialog, employeeId, refetchAvailability]
  );

  const handleDeleteAvailability = useCallback(
    (item: EmployeeAvailabilityDto) => {
      confirm({
        title: "Удалить расписание?",
        description: "Вы уверены, что хотите удалить это расписание?",
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteAvailability(item.id).unwrap();
            toast.success("Расписание удалено");
            refetchAvailability();
          } catch {
            toast.error("Ошибка при удалении");
          }
        },
      });
    },
    [confirm, deleteAvailability, refetchAvailability]
  );

  const handleCreateLeaveDays = useCallback(() => {
    leaveDaysFormDialog.open({
      employeeId,
      onSuccess: () => refetchLeaveDays(),
    });
  }, [leaveDaysFormDialog, employeeId, refetchLeaveDays]);

  const handleEditLeaveDays = useCallback(
    (item: EmployeeLeaveDaysDto) => {
      leaveDaysFormDialog.open({
        employeeId,
        leaveDays: item,
        onSuccess: () => refetchLeaveDays(),
      });
    },
    [leaveDaysFormDialog, employeeId, refetchLeaveDays]
  );

  const handleDeleteLeaveDays = useCallback(
    (item: EmployeeLeaveDaysDto) => {
      confirm({
        title: "Удалить отпуск?",
        description: "Вы уверены, что хотите удалить этот отпуск?",
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteLeaveDays(item.id).unwrap();
            toast.success("Отпуск удалён");
            refetchLeaveDays();
          } catch {
            toast.error("Ошибка при удалении");
          }
        },
      });
    },
    [confirm, deleteLeaveDays, refetchLeaveDays]
  );

  return (
    <>
      <PageHeader
        title="Рабочее расписание"
        actions={
          <Button size="sm" onClick={handleCreateAvailability}>
            <PlusCircle />
            Добавить расписание
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Availability Section */}
        <DataTable
          columns={[
            ...employeeAvailabilityColumns,
            {
              id: "actions",
              size: 100,
              cell: ({ row }) => (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditAvailability(row.original)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAvailability(row.original)}
                  >
                    <Trash />
                  </Button>
                </div>
              ),
            },
          ]}
          data={availabilities}
          isLoading={isLoadingAvailability}
          pagination={{
            ...availabilityState.handlers.pagination,
            total: totalAvailabilities,
          }}
          sort={availabilityState.handlers.sorting}
          emptyState={
            availabilityError ? (
              <DataTableErrorState
                title="Ошибка загрузки"
                error={availabilityError}
                onRetry={refetchAvailability}
              />
            ) : (
              <DataTableEmptyState
                title="Расписание не задано"
                description="Добавьте рабочее расписание сотрудника"
                icon={Calendar}
                action={
                  <Button size="sm" onClick={handleCreateAvailability}>
                    <Plus className="size-4" />
                    Добавить расписание
                  </Button>
                }
              />
            )
          }
        />

        <PageHeader
          title="Отпускные и отсутствие"
          actions={
            <Button size="sm" onClick={handleCreateLeaveDays}>
              <PlusCircle />
              Добавить отпуск
            </Button>
          }
        />

        {/* Leave Days Section */}
        <DataTable
          columns={[
            ...employeeLeaveDaysColumns,
            {
              id: "actions",
              size: 100,
              cell: ({ row }) => (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditLeaveDays(row.original)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLeaveDays(row.original)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={leaveDays}
          isLoading={isLoadingLeaveDays}
          pagination={{
            ...leaveDaysState.handlers.pagination,
            total: totalLeaveDays,
          }}
          sort={leaveDaysState.handlers.sorting}
          emptyState={
            leaveDaysError ? (
              <DataTableErrorState
                title="Ошибка загрузки"
                error={leaveDaysError}
                onRetry={refetchLeaveDays}
              />
            ) : (
              <DataTableEmptyState
                title="Отпусков нет"
                description="Добавьте отпуск или отсутствие сотрудника"
                icon={Palmtree}
                action={
                  <Button size="sm" onClick={handleCreateLeaveDays}>
                    <Plus className="size-4" />
                    Добавить отпуск
                  </Button>
                }
              />
            )
          }
        />
      </div>
    </>
  );
};
