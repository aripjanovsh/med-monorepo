import { DoctorDashboardPage } from "@/features/dashboard";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";

export default function DoctorPage() {
  return (
    <>
      <LayoutHeader title="Панель врача" />
      <CabinetContent>
        <DoctorDashboardPage />
      </CabinetContent>
    </>
  );
}
