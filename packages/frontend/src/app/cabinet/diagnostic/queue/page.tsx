"use client";

import { DepartmentQueuePanel } from "@/features/department-queue/components/department-queue-panel";

// TODO: Get from auth context / settings
const MOCKED_DIAGNOSTIC_DEPARTMENT_ID = "diagnostic-department-id";
const MOCKED_ORG_ID = "70b20fa2-49f9-4c12-860f-259bad0ddd0f";

export default function DiagnosticQueuePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Очередь УЗИ/диагностики</h1>
        <p className="text-muted-foreground">
          Управление очередью пациентов на диагностические процедуры
        </p>
      </div>

      <DepartmentQueuePanel
        departmentId={MOCKED_DIAGNOSTIC_DEPARTMENT_ID}
        departmentName="Диагностика"
        organizationId={MOCKED_ORG_ID}
      />
    </div>
  );
}
