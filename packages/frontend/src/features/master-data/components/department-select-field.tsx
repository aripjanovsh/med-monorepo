import { Combobox } from "@/components/ui/combobox";
import { get, map } from "lodash";
import { useTranslation } from "react-i18next";
import { useGetDepartmentsQuery } from "@/features/master-data/master-data-departments.api";

export type DepartmentSelectFieldProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export const DepartmentSelectField = ({
  value,
  onValueChange,
  disabled,
  className,
}: DepartmentSelectFieldProps) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetDepartmentsQuery({ limit: 100 });

  const departments = get(data, "data", []);

  const options = map(departments, (department) => ({
    label: department.name,
    value: department.id,
  }));

  return (
    <Combobox
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={t("Выберите отделение")}
      searchPlaceholder={t("Поиск отделения...")}
      emptyText={t("Отделения не найдены")}
      disabled={disabled || isLoading}
      className={className}
    />
  );
};
