"use client";

import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useUpdateProfileMutation } from "@/features/users/user.api";
import { useMe } from "@/features/auth/use-me";
import { toast } from "sonner";
import { handleFieldErrors } from "@/lib/api.utils";
import { TextField } from "@/components/fields/text-field";
import { PhoneField } from "@/components/fields/phone-field";
import { FormSection } from "@/components/form-layout";
import { AvatarUpload } from "./avatar-upload";
import * as yup from "yup";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const profileFormSchema = yup.object({
  firstName: yup.string().required("Имя обязательно"),
  middleName: yup.string().optional(),
  lastName: yup.string().required("Фамилия обязательна"),
  email: yup.string().email("Неверный формат email").optional(),
  phone: yup.string().optional(),
  avatarId: yup.string().optional(),
});

type ProfileFormData = yup.InferType<typeof profileFormSchema>;

export function ProfileForm() {
  const { user, isLoading: isLoadingUser, refetch } = useMe();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const form = useForm<ProfileFormData>({
    schema: profileFormSchema,
    mode: "onChange",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      avatarId: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? user.employee?.firstName ?? "",
        middleName: user.middleName ?? user.employee?.middleName ?? "",
        lastName: user.lastName ?? user.employee?.lastName ?? "",
        email: user.email ?? user.employee?.email ?? "",
        phone: user.employee?.phone ?? "",
        avatarId: user.avatarId ?? user.employee?.avatarId ?? "",
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        avatarId: data.avatarId || undefined,
      }).unwrap();

      toast.success("Профиль успешно обновлен!");
      refetch();
    } catch (error: unknown) {
      handleFieldErrors(error, form.setError);
      toast.error("Ошибка при обновлении профиля");
    }
  };

  const handleAvatarChange = (fileId: string | undefined) => {
    form.setValue("avatarId", fileId ?? "");
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentAvatarId = user?.avatarId ?? user?.employee?.avatarId;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <FormSection title="Фото профиля">
            <AvatarUpload
              currentAvatarId={currentAvatarId}
              onAvatarChange={handleAvatarChange}
              userName={`${user?.lastName ?? ""} ${user?.firstName ?? ""}`}
            />
          </FormSection>

          {/* Personal Information */}
          <FormSection title="Личная информация">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <TextField
                    label="Фамилия"
                    required
                    placeholder="Введите фамилию"
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <TextField
                    label="Имя"
                    required
                    placeholder="Введите имя"
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <TextField
                    label="Отчество"
                    placeholder="Введите отчество"
                    {...field}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* Contact Information */}
          <FormSection title="Контактная информация">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <TextField
                    label="Email"
                    placeholder="example@email.com"
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
            </div>
          </FormSection>

          {/* Account Information (Read-only) */}
          <FormSection title="Информация об аккаунте">
            <div className="grid grid-cols-1  gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Телефон для входа
                </p>
                <p className="text-sm">{user?.phone ?? "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Роль
                </p>
                <p className="text-sm">{user?.role ?? "—"}</p>
              </div>

              {user?.organization && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Организация
                  </p>
                  <p className="text-sm">{user.organization.name}</p>
                </div>
              )}

              {user?.employee?.department && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Отдел
                  </p>
                  <p className="text-sm">{user.employee.department.name}</p>
                </div>
              )}

              {user?.employee?.title && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Должность
                  </p>
                  <p className="text-sm">{user.employee.title.name}</p>
                </div>
              )}
            </div>
          </FormSection>

          {/* Form Actions */}
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
