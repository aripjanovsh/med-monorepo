import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { AppearanceSettings } from "@/features/profile/components/appearance-settings";

export default function Page() {
  return (
    <>
      <CabinetContent className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Мой профиль" />

        <ProfileForm />

        <AppearanceSettings />
      </CabinetContent>
    </>
  );
}
