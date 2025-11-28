"use client";

import { use } from "react";
import { PageProtocolTemplateForm } from "@/features/protocol-template";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import { ROUTES } from "@/constants/route.constants";

export default function EditProtocolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref={ROUTES.PROTOCOL_TEMPLATES}
        backTitle="Шаблоны протоколов"
      />
      <PageHeader
        title="Редактировать шаблон протокола"
        description="Редактирование шаблона медицинского протокола"
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Шаблоны протоколов", href: ROUTES.PROTOCOL_TEMPLATES },
          { label: "Редактировать" },
        ]}
      />
      <PageProtocolTemplateForm mode="edit" protocolTemplateId={id} />
    </div>
  );
}
