import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PagePatientForm } from "@/features/patients/components/page-patient-form";

export default function CreatePatientPage() {
  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/patients" backTitle="Пациенты" />
      <PageHeader title="Добавление пациента" />
      <PagePatientForm mode="create" />
    </div>
  );
}
