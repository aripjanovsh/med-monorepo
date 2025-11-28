"use client";

import { LocationTreeManager } from "@/features/master-data";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref="/cabinet/settings/master-data"
        backTitle="Справочные данные"
      />
      <PageHeader
        title="Управление локациями"
        description="Гибкая иерархия локаций: страны, регионы, города, районы"
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Локации" },
        ]}
      />

      <LocationTreeManager />
    </div>
  );
}
