"use client";

import { use } from "react";
import { PageProtocolTemplateForm } from "@/features/protocol-template";

export default function EditProtocolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PageProtocolTemplateForm mode="edit" protocolTemplateId={id} />;
}
