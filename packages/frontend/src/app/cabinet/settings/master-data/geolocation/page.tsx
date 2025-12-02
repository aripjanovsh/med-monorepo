"use client";

import { LocationTreeManager } from "@/features/master-data";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function LocationsPage() {
  return (
    <>
      <LayoutHeader
        border
        left={
          <PageBreadcrumbs
            items={[
              { label: "Настройки", href: "/cabinet/settings" },
              {
                label: "Справочные данные",
                href: "/cabinet/settings/master-data",
              },
              { label: "Локации" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6">
        <PageHeader
          title="Управление локациями"
          description="Гибкая иерархия локаций: страны, регионы, города, районы"
        />
        <LocationTreeManager />
      </CabinetContent>
    </>
  );
}
