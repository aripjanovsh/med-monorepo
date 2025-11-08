"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMeQuery } from "@/features/auth";
import { DepartmentSelectField } from "@/features/master-data";
import { DepartmentQueuePanel } from "@/features/department-queue";
import { useGetDepartmentsQuery } from "@/features/master-data";

export default function DepartmentQueuePage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  const { data: currentUser, isLoading: isLoadingUser } = useGetMeQuery();
  const { data: departmentsData } = useGetDepartmentsQuery({ limit: 100 });

  const selectedDepartment = departmentsData?.data?.find(
    (dept) => dept.id === selectedDepartmentId
  );

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
          <h1 className="text-2xl font-bold tracking-tight">
            Очередь отделений
          </h1>
          <p className="text-sm text-muted-foreground">
            Управление очередью пациентов по отделениям
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          title="Обновить"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Department Select */}
      <div className="max-w-md">
        <DepartmentSelectField
          value={selectedDepartmentId}
          onValueChange={(value) => setSelectedDepartmentId(value)}
        />
      </div>

      {/* Queue Panel */}
      {selectedDepartmentId && selectedDepartment ? (
        <DepartmentQueuePanel
          departmentId={selectedDepartmentId}
          departmentName={selectedDepartment.name}
          organizationId={currentUser.organizationId}
        />
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Выберите отделение для просмотра очереди
          </p>
        </div>
      )}
    </div>
  );
}
