import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageEmployeeForm } from "@/features/employees/components/page-employee-form";
import { ROUTES } from "@/constants/route.constants";

export default function CreateEmployeePage() {
  return (
    <>
      <LayoutHeader backHref={ROUTES.EMPLOYEES} backTitle="Сотрудники" />
      <CabinetContent className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Добавление сотрудника" />
        <PageEmployeeForm mode="create" />
      </CabinetContent>
    </>
  );
}
