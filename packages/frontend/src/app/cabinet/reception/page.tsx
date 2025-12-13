import { ReceptionDashboardPage } from "@/features/dashboard";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";

export default function ReceptionPage() {
  return (
    <>
      <CabinetContent>
        <ReceptionDashboardPage />
      </CabinetContent>
    </>
  );
}
