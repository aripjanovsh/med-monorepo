"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import * as yup from "yup";
import { toast } from "sonner";

import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { TextField } from "@/components/fields/text-field";
import { PhoneField } from "@/components/fields/phone-field";
import { TextareaField } from "@/components/fields/textarea-field";
import { FormSection } from "@/components/form-layout";
import { handleFieldErrors } from "@/lib/api.utils";
import {
  useGetMyOrganizationQuery,
  useUpdateMyOrganizationMutation,
} from "../organization.api";
import { LogoUpload } from "./logo-upload";

const organizationFormSchema = yup.object({
  name: yup.string().required("Название компании обязательно"),
  email: yup.string().email("Неверный формат email").optional(),
  phone: yup.string().optional(),
  address: yup.string().optional(),
  website: yup.string().url("Неверный формат URL").optional(),
  description: yup.string().optional(),
  logoId: yup.string().optional(),
});

type OrganizationFormData = yup.InferType<typeof organizationFormSchema>;

export function OrganizationForm() {
  const {
    data: organization,
    isLoading,
    refetch,
  } = useGetMyOrganizationQuery();
  const [updateOrganization, { isLoading: isUpdating }] =
    useUpdateMyOrganizationMutation();

  const form = useForm<OrganizationFormData>({
    schema: organizationFormSchema,
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      description: "",
      logoId: "",
    },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name ?? "",
        email: organization.email ?? "",
        phone: organization.phone ?? "",
        address: organization.address ?? "",
        website: organization.website ?? "",
        description: organization.description ?? "",
        logoId: organization.logoId ?? "",
      });
    }
  }, [organization, form]);

  const handleSubmit = async (data: OrganizationFormData) => {
    try {
      await updateOrganization({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
        logoId: data.logoId || undefined,
      }).unwrap();

      toast.success("Данные компании успешно обновлены!");
      refetch();
    } catch (error: unknown) {
      handleFieldErrors(error, form.setError);
      toast.error("Ошибка при обновлении данных компании");
    }
  };

  const handleLogoChange = (fileId: string | undefined) => {
    form.setValue("logoId", fileId ?? "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Логотип */}
          <FormSection title="Логотип компании">
            <LogoUpload
              currentLogoId={organization?.logoId}
              onLogoChange={handleLogoChange}
              companyName={organization?.name}
            />
          </FormSection>

          {/* Основная информация */}
          <FormSection title="Основная информация">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <TextField
                    label="Название компании"
                    required
                    placeholder="Введите название компании"
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <TextField
                    label="Email"
                    placeholder="info@company.com"
                    type="email"
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <PhoneField
                    label="Телефон"
                    placeholder="Введите телефон"
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <TextField
                    label="Адрес"
                    placeholder="Введите адрес"
                    {...field}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* Дополнительная информация */}
          <FormSection title="Дополнительная информация">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <TextField
                    label="Веб-сайт"
                    placeholder="https://example.com"
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <TextareaField
                    label="Описание"
                    placeholder="Краткое описание компании"
                    {...field}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* Информация об организации (только для чтения) */}
          <FormSection title="Информация об организации">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Идентификатор (slug)
                </p>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                  {organization?.slug ?? "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Статус
                </p>
                <p className="text-sm">
                  {organization?.isActive ? (
                    <span className="text-green-600">Активна</span>
                  ) : (
                    <span className="text-red-600">Неактивна</span>
                  )}
                </p>
              </div>
            </div>
          </FormSection>

          {/* Кнопка сохранения */}
          <div className="flex items-center justify-end gap-4">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
