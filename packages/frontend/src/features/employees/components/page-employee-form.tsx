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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../employee.api";
import { toast } from "sonner";
import { handleFieldErrors } from "@/lib/api.utils";
import { TitleSelectField } from "@/features/master-data/components/titles/title-select-field";
import { WorkScheduleField } from "./work-schedule-field";
import { map } from "lodash";
import { TextField } from "@/components/fields/text-field";
import { DatePickerField } from "@/components/fields/date-picker-field";
import { PhoneField } from "@/components/fields/phone-field";
import { PassportField } from "@/components/fields/passport-field";
import { GENDER_OPTIONS } from "../employee.constants";
import { employeeFormSchema, EmployeeFormData } from "../employee.schema";
import { EmployeeResponseDto } from "../employee.dto";
import { ServiceTypeListField } from "@/features/master-data/components/service-types/service-type-list-field";
import { LanguageSelectField } from "@/features/master-data/components/languages/language-select-field";
import { SelectField } from "@/components/fields/select-field";
import { RoleListField } from "@/features/roles/components/role-list-field";
import {
  LocationSelectField,
  LocationHierarchyIds,
} from "@/features/master-data/components/geolocation/location-select-field";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/route.constants";
import { FormSection } from "@/components/form-layout";

interface PageEmployeeFormProps {
  employee?: EmployeeResponseDto;
  mode: "create" | "edit";
}

const DEFAULT_VALUES: Partial<EmployeeFormData> = {
  // Core fields
  firstName: "",
  lastName: "",
  middleName: "",
  employeeId: "",
  dateOfBirth: "",
  hireDate: "",
  gender: undefined,
  
  // Passport information
  passport: "",
  passportSeries: "",
  passportNumber: "",
  passportIssuedBy: "",
  passportIssueDate: "",
  passportExpiryDate: "",

  // Contact information
  email: "",
  phone: "",
  secondaryPhone: "",
  workPhone: "",
  userAccountPhone: "",

  // Employment Details
  titleId: "",
  salary: 0,
  terminationDate: "",

  // Work details
  workSchedule: {},

  // Languages
  primaryLanguageId: "",
  secondaryLanguageId: "",

  // Notifications
  textNotificationsEnabled: false,

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

  // Additional Info
  notes: "",

  // Form-specific fields
  serviceTypeIds: [],
  createUserAccount: false,
  userAccountRoleIds: [],
};

export function PageEmployeeForm({ employee, mode }: PageEmployeeFormProps) {
  const router = useRouter();
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const form = useForm<EmployeeFormData>({
    schema: employeeFormSchema,
    mode: "onChange",
    defaultValues: DEFAULT_VALUES as EmployeeFormData,
  });

  const [lastEmployeeId, setLastEmployeeId] = React.useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    // Only reset form if employee ID changed (avoid unnecessary resets)
    if (employee?.id !== lastEmployeeId) {
      if (employee) {
        // Build locationHierarchy from individual location IDs
        const locationHierarchy: LocationHierarchyIds | undefined =
          employee.countryId ||
          employee.regionId ||
          employee.cityId ||
          employee.districtId
            ? {
                countryId: employee.countryId,
                regionId: employee.regionId,
                cityId: employee.cityId,
                districtId: employee.districtId,
                selectedId:
                  employee.districtId ||
                  employee.cityId ||
                  employee.regionId ||
                  employee.countryId,
              }
            : undefined;

        // Ensure all fields have values (empty string instead of undefined)
        // Объединяем серию и номер паспорта в одно поле
        const passport = employee.passportSeries && employee.passportNumber 
          ? `${employee.passportSeries}${employee.passportNumber}` 
          : "";

        const formData: Partial<EmployeeFormData> = {
          ...DEFAULT_VALUES,
          // Core fields
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          middleName: employee.middleName || "",
          employeeId: employee.employeeId || "",
          dateOfBirth: employee.dateOfBirth || "",
          hireDate: employee.hireDate || "",
          gender: (employee.gender as "MALE" | "FEMALE") || undefined,
          
          // Passport information
          passport,
          passportSeries: employee.passportSeries || "",
          passportNumber: employee.passportNumber || "",
          passportIssuedBy: employee.passportIssuedBy || "",
          passportIssueDate: employee.passportIssueDate || "",
          passportExpiryDate: employee.passportExpiryDate || "",

          // Contact information
          email: employee.email || "",
          phone: employee.phone || "",
          secondaryPhone: employee.secondaryPhone || "",
          workPhone: employee.workPhone || "",
          userAccountPhone: "",

          // Employment Details
          titleId: employee.titleId || "",
          salary: employee.salary || 0,
          terminationDate: employee.terminationDate || "",

          // Work details
          workSchedule: employee.workSchedule,

          // Languages
          primaryLanguageId: employee.primaryLanguageId || "",
          secondaryLanguageId: employee.secondaryLanguageId || "",

          // Notifications
          textNotificationsEnabled: employee.textNotificationsEnabled || false,

          // Address
          countryId: employee.countryId || "",
          regionId: employee.regionId || "",
          cityId: employee.cityId || "",
          districtId: employee.districtId || "",
          address: employee.address || "",
          locationHierarchy,

          // Additional Info
          notes: employee.notes || "",

          // Form-specific fields
          serviceTypeIds: map(employee?.serviceTypes, "id") || [],
          createUserAccount: false,
          userAccountRoleIds: [],
        };

        form.reset(formData as EmployeeFormData);
        setLastEmployeeId(employee.id);
      } else {
        form.reset(DEFAULT_VALUES as EmployeeFormData);
        setLastEmployeeId(undefined);
      }
    }
  }, [employee, form, lastEmployeeId]);

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      // Omit virtual UI-only fields from payload
      const { createUserAccount, locationHierarchy, ...rest } = data as any;
      if (!createUserAccount) {
        delete (rest as any).userAccountPhone;
        delete (rest as any).userAccountRoleIds;
      }

      if (employee) {
        // Update employee
        const updateDto = {
          ...rest,
          id: employee.id,
        };
        await updateEmployee(updateDto).unwrap();
        toast.success("Сотрудник успешно обновлен!");
      } else {
        // Create employee
        await createEmployee(rest as any).unwrap();
        toast.success("Сотрудник успешно создан!");
      }

      // Navigate back to employees page
      router.push(ROUTES.EMPLOYEES);
    } catch (error: any) {
      handleFieldErrors(error, form.setError);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.EMPLOYEES);
  };

  const createUserAccount = form.watch("createUserAccount");

  console.log("form.errors", form.formState.errors);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  name="titleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Должность</FormLabel>
                      <FormControl>
                        <TitleSelectField
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Выберите должность"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                  name="employeeId"
                  render={({ field }) => (
                    <TextField
                      label="ID сотрудника"
                      placeholder="Введите ID сотрудника"
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
                  name="hireDate"
                  render={({ field }) => (
                    <DatePickerField
                      label="Дата приёма"
                      placeholder="Выберите дату приёма"
                      valueFormat="yyyy-MM-dd"
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

          {/* Contact Information */}
          <FormSection title="Контактная информация">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <TextField
                      label="Электронная почта"
                      placeholder="Введите email"
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
                  name="secondaryPhone"
                  render={({ field }) => (
                    <PhoneField
                      label="Доп. телефон"
                      placeholder="Введите доп. телефон"
                      {...field}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="workPhone"
                  render={({ field }) => (
                    <PhoneField
                      label="Рабочий телефон"
                      placeholder="Введите рабочий телефон"
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

          {/* Services */}
          <FormSection title="Услуги">
            <div>
              <FormField
                control={form.control}
                name="serviceTypeIds"
                render={({ field }) => (
                  <ServiceTypeListField
                    label="Типы услуг"
                    multiple
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* Work Schedule */}
          <FormSection title="Рабочее расписание">
            <div>
              <FormField
                control={form.control}
                name="workSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <WorkScheduleField
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Notifications & User Account */}
          <FormSection title="Уведомления и аккаунт">
            <div>
              {/* Notifications */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="textNotificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Включить SMS-уведомления</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Разрешить отправку SMS этому сотруднику
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* User Account */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Аккаунт пользователя</h4>
                <FormField
                  control={form.control}
                  name="createUserAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Создать аккаунт пользователя</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Сотрудник сможет войти в систему. Телефон будет
                          использован для авторизации.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {createUserAccount && (
                  <div className="space-y-4 ml-7">
                    <FormField
                      control={form.control}
                      name="userAccountPhone"
                      render={({ field }) => (
                        <PhoneField
                          label="Телефон для авторизации"
                          placeholder="Введите телефон"
                          {...field}
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="userAccountRoleIds"
                      render={({ field }) => (
                        <RoleListField
                          label="Роли пользователя"
                          multiple
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
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
                : employee
                ? "Обновить сотрудника"
                : "Создать сотрудника"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
