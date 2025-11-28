import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/settings" backTitle="Настройки" />
      <PageHeader
        title="Пользователи"
        description="Управление пользователями системы"
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Пользователи" },
        ]}
      />
      <div className="text-muted-foreground">
        Управление пользователями в разработке...
      </div>
    </div>
  );
}
