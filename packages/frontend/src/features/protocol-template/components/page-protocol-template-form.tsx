"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtocolTemplateForm } from "./protocol-template-form";
import type { ProtocolTemplateFormData } from "../protocol-template.schema";
import {
  useGetProtocolTemplateQuery,
  useCreateProtocolTemplateMutation,
  useUpdateProtocolTemplateMutation,
} from "../protocol-template.api";
import type { UpdateProtocolTemplateRequestDto } from "../protocol-template.dto";
import PageHeader from "@/components/layouts/page-header";

type PageProtocolTemplateFormProps = {
  mode: "create" | "edit";
  protocolTemplateId?: string;
};

export const PageProtocolTemplateForm = ({
  mode,
  protocolTemplateId,
}: PageProtocolTemplateFormProps) => {
  const router = useRouter();

  const { data: protocolTemplate, isLoading: isLoadingProtocol } =
    useGetProtocolTemplateQuery(protocolTemplateId ?? "", {
      skip: mode === "create" || !protocolTemplateId,
    });

  const [createProtocolTemplate, { isLoading: isCreating }] =
    useCreateProtocolTemplateMutation();

  const [updateProtocolTemplate, { isLoading: isUpdating }] =
    useUpdateProtocolTemplateMutation();

  const isLoading = isCreating || isUpdating;

  const handleCancel = () => {
    router.push("/cabinet/settings/protocols");
  };

  const handleSuccess = () => {
    router.push("/cabinet/settings/protocols");
  };

  const handleSubmit = async (data: ProtocolTemplateFormData) => {
    if (mode === "create") {
      await createProtocolTemplate({
        name: data.name,
        description: data.description,
        content: data.content,
        templateType: data.templateType,
      }).unwrap();
    } else if (protocolTemplateId) {
      const updateData: UpdateProtocolTemplateRequestDto = {
        name: data.name,
        description: data.description,
        content: data.content,
        templateType: data.templateType,
        isActive: data.isActive,
      };

      await updateProtocolTemplate({
        id: protocolTemplateId,
        data: updateData,
      }).unwrap();
    }
  };

  if (mode === "edit" && isLoadingProtocol) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground">Загрузка протокола...</p>
        </div>
      </div>
    );
  }

  if (mode === "edit" && !protocolTemplate) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-destructive">Протокол не найден</p>
          <Button onClick={handleCancel}>Вернуться к списку</Button>
        </div>
      </div>
    );
  }

  const initialData: ProtocolTemplateFormData | undefined =
    mode === "edit" && protocolTemplate
      ? {
          name: protocolTemplate.name,
          description: protocolTemplate.description,
          content: protocolTemplate.content,
          templateType: protocolTemplate.templateType,
          isActive: protocolTemplate.isActive,
        }
      : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          mode === "create" ? "Создание протокола" : "Редактирование протокола"
        }
        description={
          mode === "create"
            ? "Создайте новый шаблон медицинского протокола"
            : "Измените шаблон медицинского протокола"
        }
      />

      <ProtocolTemplateForm
        mode={mode}
        initialData={initialData}
        onSuccess={handleSuccess}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};
