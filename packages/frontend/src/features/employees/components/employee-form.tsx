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
// Removed unused Select imports
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
import { AlarmClockOff, RefreshCw, Stethoscope, UserRound } from "lucide-react";
import { TextField } from "@/components/fields/text-field";
import { DatePickerField } from "@/components/fields/date-picker-field";
import { HeaderStepper } from "@/components/header-stepper";
import { PhoneField } from "@/components/fields/phone-field";
import { PassportField } from "@/components/fields/passport-field";
import { GENDER_OPTIONS, FORM_STEPS } from "../employee.constants";
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

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeResponseDto;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

const DEFAULT_VALUES: Partial<EmployeeFormData> = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  hireDate: "",
  gender: undefined,
  passport: "",
  passportSeries: "",
  passportNumber: "",
  passportIssuedBy: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  email: "",
  phone: "",
  secondaryPhone: "",
  workPhone: "",
  titleId: "",
  primaryLanguageId: "",
  secondaryLanguageId: "",
  countryId: "",
  regionId: "",
  cityId: "",
  districtId: "",
  address: "",
  locationHierarchy: undefined,
  textNotificationsEnabled: false,
  notes: "",
  serviceTypeIds: [],
  createUserAccount: false,
  userAccountPhone: "",
  userAccountRoleIds: [],
};

export function EmployeeForm({
  open,
  onOpenChange,
  employee,
  mode,
  onSuccess,
}: EmployeeFormProps) {
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const form = useForm<EmployeeFormData>({
    schema: employeeFormSchema,
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;

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

      // Объединяем серию и номер паспорта в одно поле
      const passport =
        employee.passportSeries && employee.passportNumber
          ? `${employee.passportSeries}${employee.passportNumber}`
          : "";

      form.reset({
        ...DEFAULT_VALUES,
        ...employee,
        serviceTypeIds: map(employee?.serviceTypes, "id"),
        locationHierarchy,
        passport,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [open, employee]);

  const isLoading = isCreating || isUpdating;

  // Stepper configuration
  const steps = FORM_STEPS.map((step, index) => ({
    ...step,
    Icon: [UserRound, Stethoscope, RefreshCw, AlarmClockOff][index],
  }));
  const [step, setStep] = React.useState(0);

  const validateCurrentStep = React.useCallback(async () => {
    if (step === 0) {
      return await form.trigger(["firstName", "lastName", "hireDate"]);
    }
    if (step === 3) {
      return await form.trigger([
        "createUserAccount",
        "userAccountPhone",
        "userAccountRoleIds",
      ]);
    }
    return true;
  }, [step, form]);

  const goNext = async () => {
    const ok = await validateCurrentStep();
    if (ok) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

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

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      handleFieldErrors(error, form.setError);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const createUserAccount = form.watch("createUserAccount");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Добавить нового сотрудника"
              : "Редактировать сотрудника"}
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
                      <h3 className="font-semibold font-gilroy">Информация</h3>
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
                                    value.slice(0, 2),
                                  );
                                  form.setValue(
                                    "passportNumber",
                                    value.slice(2),
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
                      <h3 className="font-semibold font-gilroy">Контакты</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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

                    <div className="space-y-4">
                      <h3 className="font-semibold font-gilroy">Адрес</h3>
                      <div className="grid grid-cols-1 gap-4 items-start">
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
                                      form.setValue(
                                        "countryId",
                                        value.countryId || "",
                                      );
                                      form.setValue(
                                        "regionId",
                                        value.regionId || "",
                                      );
                                      form.setValue(
                                        "cityId",
                                        value.cityId || "",
                                      );
                                      form.setValue(
                                        "districtId",
                                        value.districtId || "",
                                      );
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
                    </div>
                  </>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold font-gilroy">Услуги</h3>
                    <div className="space-y-4">
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
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
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
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Уведомления</h3>
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

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Аккаунт</h3>
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
                              <FormLabel>
                                Создать аккаунт пользователя
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Сотрудник сможет войти в систему. Телефон будет
                                использован для авторизации.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {createUserAccount && (
                        <div className="space-y-4">
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
                  </>
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
                    : employee
                      ? "Обновить сотрудника"
                      : "Создать сотрудника"}
                </Button>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
