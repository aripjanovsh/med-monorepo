"use client";

import { DepartmentQueuePanel } from "@/features/department-queue/components/department-queue-panel";

// TODO: Get from auth context / settings
const MOCKED_LAB_DEPARTMENT_ID = "2154443c-5356-4ab7-8d76-40f807630243";
const MOCKED_ORG_ID = "79de626d-f5b5-4818-b963-18e1c31c6acf";

export default function LabQueuePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Очередь лаборатории</h1>
        <p className="text-muted-foreground">
          Управление очередью пациентов на анализы
        </p>
      </div>

      <DepartmentQueuePanel
        departmentId={MOCKED_LAB_DEPARTMENT_ID}
        departmentName="Лаборатория"
        organizationId={MOCKED_ORG_ID}
      />
    </div>
  );
}
