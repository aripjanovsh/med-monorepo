"use client";

import React, { useEffect } from "react";
import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetBody,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, UserRound, Heart, Users, Phone } from "lucide-react";
import { toast } from "sonner";

import { TextField } from "@/components/fields/text-field";
import { DatePickerField } from "@/components/fields/date-picker-field";
import { HeaderStepper } from "@/components/header-stepper";
import { PhoneField } from "@/components/fields/phone-field";
import { PassportField } from "@/components/fields/passport-field";
import { SelectField } from "@/components/fields/select-field";
import { LanguageSelectField } from "@/features/master-data/components/languages/language-select-field";
import { LocationSelectField } from "@/features/master-data/components/geolocation/location-select-field";
import type { LocationHierarchyIds } from "@/features/master-data/components/geolocation/location-select-field";
import { handleFieldErrors } from "@/lib/api.utils";

import {
  patientFormSchema,
  PatientFormData,
  PatientFormStep1Extended,
} from "../patient.schema";
import {
  mapPatientToFormData,
  mapFormDataToCreateRequest,
  mapFormDataToUpdateRequest,
} from "../patient.model";
import {
  PATIENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  FORM_STEPS,
} from "../patient.constants";
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
} from "../patient.api";
import { PatientResponseDto } from "../patient.dto";

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: PatientResponseDto;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

const DEFAULT_VALUES: Partial<PatientFormData> = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  gender: undefined,
  status: "ACTIVE" as const,
  passport: "",
  passportSeries: "",
  passportNumber: "",
  passportIssuedBy: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  primaryLanguageId: "",
  secondaryLanguageId: "",
  countryId: "",
  regionId: "",
  cityId: "",
  districtId: "",
  address: "",
  locationHierarchy: undefined as LocationHierarchyIds | undefined,
  phone: "",
  secondaryPhone: "",
  email: "",
};

export function PatientForm({
  open,
  onOpenChange,
  patient,
  mode,
  onSuccess,
}: PatientFormProps) {
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

  const form = useForm<PatientFormData>({
    schema: patientFormSchema,
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;

    if (patient) {
      const formData = mapPatientToFormData(patient);
      // Объединяем серию и номер паспорта в одно поле
      const passport =
        patient.passportSeries && patient.passportNumber
          ? `${patient.passportSeries}${patient.passportNumber}`
          : "";
      form.reset({
        ...DEFAULT_VALUES,
        ...formData,
        dateOfBirth: patient.dateOfBirth
          ? patient.dateOfBirth.split("T")[0]
          : "",
        passport,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [open, patient, form]);

  const isLoading = isCreating || isUpdating;

  // Stepper configuration
  const steps = FORM_STEPS.map((step, index) => ({
    ...step,
    Icon: [UserRound, Users, Heart, Phone][index],
  }));
  const [step, setStep] = React.useState(0);

  const validateCurrentStep = React.useCallback(async () => {
    if (step === 0) {
      return await form.trigger([
        "firstName",
        "lastName",
        "dateOfBirth",
        "gender",
      ]);
    }
    if (step === 1) {
      return await form.trigger(["phone", "secondaryPhone", "email"]);
    }
    return true;
  }, [step, form]);

  // Handle location hierarchy changes
  const handleLocationChange = React.useCallback(
    (value: LocationHierarchyIds | undefined) => {
      if (value) {
        form.setValue("countryId", value.countryId || "");
        form.setValue("regionId", value.regionId || "");
        form.setValue("cityId", value.cityId || "");
        form.setValue("districtId", value.districtId || "");
      } else {
        form.setValue("countryId", "");
        form.setValue("regionId", "");
        form.setValue("cityId", "");
        form.setValue("districtId", "");
      }
      form.setValue("locationHierarchy", value || {});
    },
    [form]
  );

  const goNext = async () => {
    const ok = await validateCurrentStep();
    if (ok) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (data: PatientFormData) => {
    try {
      if (patient) {
        // Update patient
        const updateDto = mapFormDataToUpdateRequest(data, patient.id);
        await updatePatient(updateDto).unwrap();
        toast.success("Пациент успешно обновлен!");
      } else {
        // Create patient
        const createDto = mapFormDataToCreateRequest(data);
        await createPatient(createDto as any).unwrap();
        toast.success("Пациент успешно создан!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      handleFieldErrors(error, form.setError);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Добавить нового пациента"
              : "Редактировать пациента"}
          </SheetTitle>
        </SheetHeader>

        <SheetBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Stepper header */}
              <HeaderStepper steps={steps} step={step} />

              {/* Step content */}
              <div className="space-y-6">
                {step === 0 && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold font-gilroy">
                        Основная информация
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                          name="dateOfBirth"
                          render={({ field }) => (
                            <DatePickerField
                              label="Дата рождения"
                              required
                              placeholder="Выберите дату рождения"
                              valueFormat="yyyy-MM-dd"
                              {...field}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <SelectField
                              label="Пол"
                              required
                              placeholder="Выберите пол"
                              options={GENDER_OPTIONS}
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
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold font-gilroy">
                        Паспортные данные
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <FormField
                          control={form.control}
                          name="passport"
                          render={({ field }) => (
                            <PassportField
                              label="Серия и номер паспорта"
                              placeholder="AA 1234567"
                              {...field}
                              onChange={(value: string) => {
                                field.onChange(value);
                                // Автоматически разделяем на серию и номер
                                if (value && value.length >= 2) {
                                  form.setValue(
                                    "passportSeries",
                                    value.slice(0, 2)
                                  );
                                  form.setValue(
                                    "passportNumber",
                                    value.slice(2)
                                  );
                                } else {
                                  form.setValue("passportSeries", "");
                                  form.setValue("passportNumber", "");
                                }
                              }}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passportIssuedBy"
                          render={({ field }) => (
                            <TextField
                              label="Кем выдан"
                              placeholder="Введите название органа"
                              {...field}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passportIssueDate"
                          render={({ field }) => (
                            <DatePickerField
                              label="Дата выдачи"
                              placeholder="Выберите дату"
                              valueFormat="yyyy-MM-dd"
                              {...field}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passportExpiryDate"
                          render={({ field }) => (
                            <DatePickerField
                              label="Действителен до"
                              placeholder="Выберите дату"
                              valueFormat="yyyy-MM-dd"
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold font-gilroy">Языки</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <FormField
                          control={form.control}
                          name="primaryLanguageId"
                          render={({ field }) => (
                            <LanguageSelectField
                              label="Основной язык"
                              placeholder="Выберите язык"
                              {...field}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="secondaryLanguageId"
                          render={({ field }) => (
                            <LanguageSelectField
                              label="Второй язык"
                              placeholder="Выберите язык"
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold font-gilroy">Адрес</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="locationHierarchy"
                          render={({ field }) => (
                            <LocationSelectField
                              label="Местоположение"
                              placeholder="Выберите страну, регион, город или район"
                              value={field.value}
                              onChange={handleLocationChange}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <TextField
                              label="Точный адрес"
                              placeholder="Введите улицу, дом, квартиру"
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold font-gilroy">
                      Контактная информация
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <PhoneField
                            label="Основной телефон"
                            placeholder="Введите телефон"
                            {...field}
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondaryPhone"
                        render={({ field }) => (
                          <PhoneField
                            label="Дополнительный телефон"
                            placeholder="Введите доп. телефон"
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
                            placeholder="Введите email"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold font-gilroy">
                      Назначение врачей
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Здесь будет компонент для выбора врачей
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold font-gilroy">
                      Дополнительная информация
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Дополнительные настройки и информация о пациенте
                    </p>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </SheetBody>

        <SheetFooter>
          <div className="flex items-center gap-3 w-full">
            {step < 1 && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Отмена
              </Button>
            )}

            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="min-w-[100px]"
              >
                Назад
              </Button>
            )}

            <div className="flex items-center gap-3 ml-auto">
              {step < steps.length - 1 && (
                <Button
                  type="button"
                  onClick={goNext}
                  className="min-w-[100px]"
                >
                  Далее
                </Button>
              )}

              {step === steps.length - 1 && (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[140px]"
                  onClick={form.handleSubmit(handleSubmit)}
                >
                  {isLoading
                    ? "Сохранение..."
                    : patient
                      ? "Обновить пациента"
                      : "Создать пациента"}
                </Button>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
