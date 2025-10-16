import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageEmployeeForm } from "@/features/employees/components/page-employee-form";

export default function CreateEmployeePage() {
  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/employees" backTitle="Сотрудники" />
      <PageHeader title="Добавление сотрудника" />
      <PageEmployeeForm mode="create" />
    </div>
  );
}
