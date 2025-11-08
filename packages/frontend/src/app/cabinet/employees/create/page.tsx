import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageEmployeeForm } from "@/features/employees/components/page-employee-form";
import { ROUTES } from "@/constants/route.constants";

export default function CreateEmployeePage() {
  return (
    <div className="space-y-6">
      <LayoutHeader backHref={ROUTES.EMPLOYEES} backTitle="Сотрудники" />
      <PageHeader title="Добавление сотрудника" />
      <PageEmployeeForm mode="create" />
    </div>
  );
}
