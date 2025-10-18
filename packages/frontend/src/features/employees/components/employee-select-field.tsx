import {
  ComboboxField,
  SingleComboboxFieldProps,
} from "@/components/fields/combobox-field";
import { get, map } from "lodash";
import { useTranslation } from "react-i18next";
import { useGetEmployeesQuery } from "@/features/employees/employee.api";

export type EmployeeSelectFieldProps = Omit<SingleComboboxFieldProps, "options">;

export const EmployeeSelectField = ({ ...props }: EmployeeSelectFieldProps) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetEmployeesQuery({ limit: 100 });

  const employees = get(data, "data", []);

  const options = map(employees, (employee) => ({
    label: `${employee.lastName} ${employee.firstName} ${employee.middleName || ""}`.trim(),
    value: employee.id,
  }));

  return (
    <ComboboxField
      {...props}
      options={options}
      placeholder={t("Выберите врача")}
      searchPlaceholder={t("Поиск врача...")}
      empty={t("Врачи не найдены")}
    />
  );
};
