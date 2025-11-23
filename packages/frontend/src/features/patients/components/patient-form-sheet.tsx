"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { PhoneField } from "@/components/fields/phone-field";
import { PassportField } from "@/components/fields/passport-field";
import { SelectField } from "@/components/fields/select-field";
import { LanguageSelectField } from "@/features/master-data/components/languages/language-select-field";
import { LocationSelectField } from "@/features/master-data/components/geolocation/location-select-field";
import type { LocationHierarchyIds } from "@/features/master-data/components/geolocation/location-select-field";
import { handleFieldErrors } from "@/lib/api.utils";
import type { DialogProps } from "@/lib/dialog-manager";

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
import type { PatientResponseDto } from "../patient.dto";
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useGetPatientQuery,
} from "../patient.api";

type PatientFormSheetOwnProps = {
  mode: "create" | "edit";
  patientId?: string | null;
  onSuccess?: (patient?: PatientResponseDto) => void;
};

type PatientFormSheetProps = PatientFormSheetOwnProps & DialogProps;

const DEFAULT_VALUES: Partial<PatientFormData> = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  gender: undefined,
  status: "ACTIVE" as const,
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

export const PatientFormSheet = ({
  open,
  onOpenChange,
  mode,
  patientId,
  onSuccess,
}: PatientFormSheetProps) => {
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

  const { data: patient } = useGetPatientQuery(
    { id: patientId as string },
    { skip: !patientId || mode !== "edit" }
  );

  const form = useForm<PatientFormData>({
    schema: patientFormSchema,
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (patient && mode === "edit") {
      const formData = mapPatientToFormData(patient);
      form.reset({
        ...DEFAULT_VALUES,
        ...formData,
        dateOfBirth: patient.dateOfBirth
          ? patient.dateOfBirth.split("T")[0]
          : "",
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [open, patient, form]);

  const isLoading = isCreating || isUpdating;

  const handleLocationChange = useCallback(
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

  const handleSubmit = async (data: PatientFormData) => {
    try {
      let createdPatient: PatientResponseDto | undefined;

      if (mode === "edit") {
        // Update patient
        const updateDto = mapFormDataToUpdateRequest(data, patientId as string);
        createdPatient = await updatePatient(updateDto as any).unwrap();
        toast.success("Пациент успешно обновлен!");
      } else {
        // Create patient
        const createDto = mapFormDataToCreateRequest(data);
        createdPatient = await createPatient(createDto as any).unwrap();
        toast.success("Пациент успешно создан!");
      }

      onOpenChange(false);
      onSuccess?.(createdPatient);
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
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold font-gilroy">
                    Основная информация
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                          required
                          placeholder="Введите отчество"
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
                  </div>
                </div>

                <div className="border-t border-border -mx-4 lg:-mx-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold font-gilroy">
                    Паспортные данные
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="grid grid-cols-2 gap-2 items-start">
                      <FormField
                        control={form.control}
                        name="passportSeries"
                        render={({ field }) => (
                          <TextField
                            label="Серия паспорта"
                            placeholder="AA"
                            maxLength={2}
                            {...field}
                            onChange={(value?: string) => {
                              field.onChange(
                                value ? value.toUpperCase() : value
                              );
                              // Trigger validation for all passport fields
                              form.trigger([
                                "passportSeries",
                                "passportNumber",
                                "passportIssuedBy",
                                "passportIssueDate",
                                "passportExpiryDate",
                              ]);
                            }}
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <TextField
                            label="Номер паспорта"
                            placeholder="1234567"
                            maxLength={7}
                            {...field}
                            onChange={(value: string) => {
                              field.onChange(value);
                              // Trigger validation for all passport fields
                              form.trigger([
                                "passportSeries",
                                "passportNumber",
                                "passportIssuedBy",
                                "passportIssueDate",
                                "passportExpiryDate",
                              ]);
                            }}
                          />
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="passportIssuedBy"
                      render={({ field }) => (
                        <TextField
                          label="Кем выдан"
                          placeholder="Введите название органа"
                          {...field}
                          onChange={(value: string) => {
                            field.onChange(value);
                            // Trigger validation for all passport fields
                            form.trigger([
                              "passportSeries",
                              "passportNumber",
                              "passportIssuedBy",
                              "passportIssueDate",
                              "passportExpiryDate",
                            ]);
                          }}
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
                          onChange={(value?: string) => {
                            field.onChange(value || "");
                            // Trigger validation for all passport fields
                            form.trigger([
                              "passportSeries",
                              "passportNumber",
                              "passportIssuedBy",
                              "passportIssueDate",
                              "passportExpiryDate",
                            ]);
                          }}
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
                          onChange={(value?: string) => {
                            field.onChange(value || "");
                            // Trigger validation for all passport fields
                            form.trigger([
                              "passportSeries",
                              "passportNumber",
                              "passportIssuedBy",
                              "passportIssueDate",
                              "passportExpiryDate",
                            ]);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="border-t border-border -mx-4 lg:-mx-6" />

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

                <div className="border-t border-border -mx-4 lg:-mx-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold font-gilroy">Адрес</h3>
                  <div className="grid grid-cols-1 gap-4 items-start">
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
                          label="Улица, дом, квартира"
                          placeholder="Введите улицу, дом, квартиру"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="border-t border-border -mx-4 lg:-mx-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold font-gilroy">
                    Контактная информация
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <PhoneField
                          required
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
              </div>
            </form>
          </Form>
        </SheetBody>

        <SheetFooter>
          <div className="flex items-center gap-3 w-full">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Отмена
            </Button>

            <div className="flex items-center gap-3 ml-auto">
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[140px]"
                onClick={form.handleSubmit(handleSubmit)}
              >
                {isLoading
                  ? "Сохранение..."
                  : mode === "edit"
                    ? "Обновить пациента"
                    : "Создать пациента"}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
