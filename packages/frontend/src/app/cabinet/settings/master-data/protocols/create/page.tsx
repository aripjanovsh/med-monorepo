"use client";

import { PageProtocolTemplateForm } from "@/features/protocol-template";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import { ROUTES } from "@/constants/route.constants";

export default function CreateProtocolPage() {
  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref={ROUTES.PROTOCOL_TEMPLATES}
        backTitle="Шаблоны протоколов"
      />
      <PageHeader
        title="Создать шаблон протокола"
        description="Создание нового шаблона медицинского протокола"
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Шаблоны протоколов", href: ROUTES.PROTOCOL_TEMPLATES },
          { label: "Создать" },
        ]}
      />
      <PageProtocolTemplateForm mode="create" />
    </div>
  );
}
