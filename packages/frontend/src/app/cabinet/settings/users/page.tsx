import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function UsersPage() {
  return (
    <>
      <LayoutHeader
        border
        left={
          <PageBreadcrumbs
            items={[
              { label: "Настройки", href: "/cabinet/settings" },
              { label: "Пользователи" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Пользователи"
          description="Управление пользователями системы"
        />
        <div className="text-muted-foreground">
          Управление пользователями в разработке...
        </div>
      </CabinetContent>
    </>
  );
}
