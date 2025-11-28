import { OrganizationForm } from "@/features/organization";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function CompanySettingsPage() {
  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/settings" backTitle="Настройки" />
      <PageHeader
        title="Компания"
        description="Основная информация о компании"
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Компания" },
        ]}
      />
      <OrganizationForm />
    </div>
  );
}
