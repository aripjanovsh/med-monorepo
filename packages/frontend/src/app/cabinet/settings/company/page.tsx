import { OrganizationForm } from "@/features/organization";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function CompanySettingsPage() {
  return (
    <>
      <LayoutHeader
        // backHref="/cabinet/settings"
        // backTitle="Настройки"
        border
        left={
          <PageBreadcrumbs
            items={[
              { label: "Настройки", href: "/cabinet/settings" },
              { label: "Компания" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Компания"
          description="Основная информация о компании"
        />
        <OrganizationForm />
      </CabinetContent>
    </>
  );
}
