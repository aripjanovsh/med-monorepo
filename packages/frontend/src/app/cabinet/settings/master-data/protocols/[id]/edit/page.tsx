"use client";

import { use } from "react";
import { PageProtocolTemplateForm } from "@/features/protocol-template";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
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
              { label: "Шаблоны протоколов", href: ROUTES.PROTOCOL_TEMPLATES },
              { label: "Редактировать" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6">
        <PageHeader
          title="Редактировать шаблон протокола"
          description="Редактирование шаблона медицинского протокола"
        />
        <PageProtocolTemplateForm mode="edit" protocolTemplateId={id} />
      </CabinetContent>
    </>
  );
}
