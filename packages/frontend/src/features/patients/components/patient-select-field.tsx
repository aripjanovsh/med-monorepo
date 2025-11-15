import {
  ComboboxField,
  SingleComboboxFieldProps,
} from "@/components/fields/combobox-field";
import { get, map } from "lodash";
import { useTranslation } from "react-i18next";
import { useGetPatientsQuery } from "@/features/patients/patient.api";

export type PatientSelectFieldProps = Omit<SingleComboboxFieldProps, "options">;

export const PatientSelectField = ({ ...props }: PatientSelectFieldProps) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetPatientsQuery({ limit: 100 });

  const patients = get(data, "data", []);

  const options = map(patients, (patient) => ({
    label:
      `${patient.lastName} ${patient.firstName} ${patient.middleName || ""}`.trim(),
    value: patient.id,
  }));

  return (
    <ComboboxField
      {...props}
      options={options}
      placeholder={t("Выберите пациента")}
      searchPlaceholder={t("Поиск пациента...")}
      empty={t("Пациенты не найдены")}
    />
  );
};
