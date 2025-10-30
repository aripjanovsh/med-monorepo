import type { ReactElement } from "react";
import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetBody,
} from "@/components/ui/sheet";
import { toast } from "sonner";

import { TextField } from "@/components/fields/text-field";
import { DatePickerField } from "@/components/fields/date-picker-field";
import { PhoneField } from "@/components/fields/phone-field";
import { SelectField } from "@/components/fields/select-field";
import { handleFieldErrors } from "@/lib/api.utils";

import {
  patientQuickCreateSchema,
  type PatientQuickCreateData,
} from "../patient.schema";
import { GENDER_OPTIONS } from "../patient.constants";
import { useCreatePatientMutation } from "../patient.api";
import type {
  PatientResponseDto,
  CreatePatientRequestDto,
} from "../patient.dto";

type PatientQuickCreateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patient: PatientResponseDto) => void;
  defaultSearch?: string;
};

const DEFAULT_VALUES: Partial<PatientQuickCreateData> = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  gender: undefined,
  primaryPhone: "",
};

export const PatientQuickCreateSheet = ({
  open,
  onOpenChange,
  onSuccess,
  defaultSearch,
}: PatientQuickCreateSheetProps): ReactElement => {
  const [createPatient, { isLoading }] = useCreatePatientMutation();

  const form = useForm<PatientQuickCreateData>({
    schema: patientQuickCreateSchema,
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const handleSubmit = async (data: PatientQuickCreateData) => {
    try {
      const createDto: CreatePatientRequestDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender as "MALE" | "FEMALE",
        status: "ACTIVE",
        contacts: [
          {
            relation: "SELF",
            type: "PRIMARY",
            primaryPhone: data.primaryPhone,
            textNotificationsEnabled: false,
            emailNotificationsEnabled: false,
          },
        ],
      };

      const result = await createPatient(createDto).unwrap();
      toast.success("Пациент успешно создан!");

      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      onSuccess?.(result);
    } catch (error: unknown) {
      handleFieldErrors(error, form.setError);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset(DEFAULT_VALUES);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset(DEFAULT_VALUES);
    } else if (defaultSearch) {
      // Insert entire search text into firstName
      form.setValue("firstName", defaultSearch.trim());
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Добавить нового пациента</SheetTitle>
        </SheetHeader>

        <SheetBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
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
                name="middleName"
                render={({ field }) => (
                  <TextField
                    label="Отчество"
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
                    placeholder="ДД.ММ.ГГГГ"
                    maxDate={new Date()}
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
                name="primaryPhone"
                render={({ field }) => (
                  <PhoneField
                    label="Основной телефон"
                    required
                    placeholder="Введите телефон"
                    {...field}
                  />
                )}
              />
            </form>
          </Form>
        </SheetBody>

        <SheetFooter>
          <div className="flex items-center gap-3 w-full">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Отмена
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="ml-auto min-w-[140px]"
              onClick={form.handleSubmit(handleSubmit)}
            >
              {isLoading ? "Создание..." : "Создать пациента"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
