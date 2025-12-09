import type { ReactElement } from "react";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AsyncComboboxField,
  type AsyncOption,
} from "@/components/fields/async-combobox-field";
import type { FieldProps } from "@/components/fields/field";
import { useGetEmployeesQuery } from "@/features/employees/employee.api";
import { getEmployeeFullName } from "../employee.model";
import { UserAvatar } from "@/components/ui/user-avatar";

type EmployeeAutocompleteFieldProps = Omit<FieldProps, "children"> & {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  status?: "ACTIVE" | "INACTIVE" | "ALL";
};

export const EmployeeAutocompleteField = ({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  empty,
  status = "ACTIVE",
  ...fieldProps
}: EmployeeAutocompleteFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetEmployeesQuery({
    search,
    limit: 20,
    status: status === "ALL" ? undefined : status,
  });

  const employees = data?.data ?? [];

  const options: AsyncOption[] = useMemo(() => {
    return employees.map((employee) => ({
      label: (
        <div className="flex items-center gap-2">
          <UserAvatar
            avatarId={employee.avatarId}
            name={getEmployeeFullName(employee)}
            className="size-8"
          />
          <div className="flex flex-col">
            <span>{getEmployeeFullName(employee)}</span>
            <span className="text-xs text-muted-foreground">
              {employee.title?.name || ""}
            </span>
          </div>
        </div>
      ),
      displayLabel: getEmployeeFullName(employee),
      value: employee.id,
    }));
  }, [employees]);

  const loadOptions = useCallback(async (searchValue: string) => {
    setSearch(searchValue);
  }, []);

  return (
    <AsyncComboboxField
      {...fieldProps}
      value={value}
      onChange={onChange}
      options={options}
      loading={isLoading}
      loadOptions={loadOptions}
      placeholder={placeholder ?? t("Выберите врача")}
      searchPlaceholder={searchPlaceholder ?? t("Поиск врача...")}
      empty={empty ?? t("Врачи не найдены")}
    />
  );
};
