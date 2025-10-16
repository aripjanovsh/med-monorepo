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
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/route.constants";
import { FormSection } from "@/components/form-layout";
import { handleFieldErrors } from "@/lib/api.utils";
import { isMinor } from "@/lib/date.utils";

import { TextField } from "@/components/fields/text-field";
import { DatePickerField } from "@/components/fields/date-picker-field";
import { PhoneField } from "@/components/fields/phone-field";
import { PassportField } from "@/components/fields/passport-field";
import { SelectField } from "@/components/fields/select-field";
import { LanguageSelectField } from "@/features/master-data/components/languages/language-select-field";
import { LocationSelectField } from "@/features/master-data/components/geolocation/location-select-field";

import { patientFormSchema, PatientFormData } from "../patient.schema";
import {
  mapPatientToFormData,
  mapFormDataToCreateRequest,
  mapFormDataToUpdateRequest,
} from "../patient.model";
import {
  PATIENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  CONTACT_RELATION_OPTIONS,
  CONTACT_TYPE_OPTIONS,
} from "../patient.constants";
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
} from "../patient.api";
import { PatientResponseDto } from "../patient.dto";

interface PagePatientFormProps {
  patient?: PatientResponseDto;
  mode: "create" | "edit";
}

const DEFAULT_VALUES: Partial<PatientFormData> = {
  // Core fields
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  gender: undefined,
  status: "ACTIVE",
  
  // Passport information
  passport: "",
  passportSeries: "",
  passportNumber: "",
  passportIssuedBy: "",
  passportIssueDate: "",
  passportExpiryDate: "",

  // Languages
  primaryLanguageId: "",
  secondaryLanguageId: "",

  // Address
  countryId: "",
  regionId: "",
  cityId: "",
  districtId: "",
  address: "",
  locationHierarchy: {
    countryId: "",
    regionId: "",
    cityId: "",
    districtId: "",
    selectedId: "",
  },

  // Contacts
  contacts: [
    {
      relation: "SELF",
      type: "PRIMARY",
      primaryPhone: "",
      textNotificationsEnabled: false,
      emailNotificationsEnabled: false,
    },
  ],

  // Doctors
  doctorIds: [],

  // Additional Info
  notes: "",
};

export function PagePatientForm({ patient, mode: _mode }: PagePatientFormProps) {
  const router = useRouter();
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

  const form = useForm<PatientFormData>({
    schema: patientFormSchema,
    mode: "onChange",
    defaultValues: DEFAULT_VALUES as PatientFormData,
  });

  const [lastPatientId, setLastPatientId] = React.useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    // Only reset form if patient ID changed (avoid unnecessary resets)
    if (patient?.id !== lastPatientId) {
      if (patient) {
        const formData = mapPatientToFormData(patient);
        // Объединяем серию и номер паспорта в одно поле
        const passport = patient.passportSeries && patient.passportNumber 
          ? `${patient.passportSeries}${patient.passportNumber}` 
          : "";
        form.reset({
          ...formData,
          passport,
        });
        setLastPatientId(patient.id);
      } else {
        form.reset(DEFAULT_VALUES as PatientFormData);
        setLastPatientId(undefined);
      }
    }
  }, [patient, form, lastPatientId]);

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (data: PatientFormData) => {
    try {
      if (patient) {
        // Update patient
        const updateDto = mapFormDataToUpdateRequest(data, patient.id);
        await updatePatient({ id: patient.id, ...updateDto }).unwrap();
        toast.success("Пациент успешно обновлен!");
      } else {
        // Create patient
        const createDto = mapFormDataToCreateRequest(data);
        await createPatient(createDto).unwrap();
        toast.success("Пациент успешно создан!");
      }

      // Navigate back to patients page
      router.push(ROUTES.PATIENTS);
    } catch (error: any) {
      handleFieldErrors(error, form.setError);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.PATIENTS);
  };

  const contacts = form.watch("contacts") || [];
  const dateOfBirth = form.watch("dateOfBirth");

  // Check if patient is minor
  const patientIsMinor = isMinor(dateOfBirth);
  const showRelationField = dateOfBirth && patientIsMinor;

  // Get used contact types
  const usedContactTypes = contacts.map((c) => c.type);
  const availableContactTypes = CONTACT_TYPE_OPTIONS.filter(
    (option) => !usedContactTypes.includes(option.value as any)
  );

  const addContact = (type: string) => {
    const newContact = {
      relation: showRelationField ? ("OTHER" as const) : ("SELF" as const),
      type: type as any,
      primaryPhone: "",
      textNotificationsEnabled: false,
      emailNotificationsEnabled: false,
    };
    form.setValue("contacts", [...contacts, newContact]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      const updatedContacts = contacts.filter((_, i) => i !== index);
      form.setValue("contacts", updatedContacts);
    }
  };

  // Get contact type label
  const getContactTypeLabel = (type: string) => {
    return (
      CONTACT_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type
    );
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <FormSection title="Основная информация" description="">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Выберите пол"
                      options={GENDER_OPTIONS}
                      {...field}
                    />
                  )}
                />

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
          </FormSection>

          {/* Passport Information */}
          <FormSection title="Паспортные данные">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          form.setValue("passportSeries", value.slice(0, 2));
                          form.setValue("passportNumber", value.slice(2));
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
          </FormSection>

          {/* Address Information */}
          <FormSection title="Адрес">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="locationHierarchy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Местоположение</FormLabel>
                    <FormControl>
                      <LocationSelectField
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          // Update individual location fields
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
                        }}
                        placeholder="Выберите местоположение"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <TextField
                    label="Адрес"
                    placeholder="Введите точный адрес"
                    {...field}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* Contact Information */}
          <FormSection title="Контактная информация">
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="space-y-4 p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center justify-between min-h-10">
                    <h4 className="text-lg font-semibold">
                      {getContactTypeLabel(contact.type)}
                    </h4>
                    {contacts.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeContact(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show relation field only if patient is minor */}
                    {showRelationField && (
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.relation`}
                        render={({ field }) => (
                          <SelectField
                            label="Отношение"
                            placeholder="Выберите отношение"
                            options={CONTACT_RELATION_OPTIONS}
                            {...field}
                          />
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name={`contacts.${index}.primaryPhone`}
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
                      name={`contacts.${index}.secondaryPhone`}
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
                      name={`contacts.${index}.email`}
                      render={({ field }) => (
                        <TextField
                          label="Email"
                          placeholder="Введите email"
                          type="email"
                          {...field}
                        />
                      )}
                    />

                    {/* Show first/last name only if relation is not SELF */}
                    {contact.relation !== "SELF" && (
                      <>
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.firstName`}
                          render={({ field }) => (
                            <TextField
                              label="Имя контакта"
                              placeholder="Введите имя"
                              {...field}
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`contacts.${index}.lastName`}
                          render={({ field }) => (
                            <TextField
                              label="Фамилия контакта"
                              placeholder="Введите фамилию"
                              {...field}
                            />
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Add contact buttons - one for each available type */}
              {availableContactTypes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Добавить контакт:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableContactTypes.map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant="outline"
                        onClick={() => addContact(type.value)}
                        className="flex-1 min-w-[150px]"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* Additional Information */}
          <FormSection title="Дополнительная информация">
            <div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заметки</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Введите дополнительные заметки"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Сохранение..."
                : patient
                ? "Обновить пациента"
                : "Создать пациента"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
