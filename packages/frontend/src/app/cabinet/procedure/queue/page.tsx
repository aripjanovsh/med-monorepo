"use client";

import { DepartmentQueuePanel } from "@/features/department-queue/components/department-queue-panel";

// TODO: Get from auth context / settings
const MOCKED_PROCEDURE_DEPARTMENT_ID = "procedure-department-id";
const MOCKED_ORG_ID = "70b20fa2-49f9-4c12-860f-259bad0ddd0f";

export default function ProcedureQueuePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Очередь процедурной</h1>
        <p className="text-muted-foreground">
          Управление очередью пациентов на процедуры
        </p>
      </div>

      <DepartmentQueuePanel
        departmentId={MOCKED_PROCEDURE_DEPARTMENT_ID}
        departmentName="Процедурная"
        organizationId={MOCKED_ORG_ID}
      />
    </div>
  );
}
