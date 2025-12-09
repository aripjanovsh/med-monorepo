import type { ReactElement } from "react";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  AsyncComboboxField,
  type AsyncOption,
} from "@/components/fields/async-combobox-field";
import type { FieldProps } from "@/components/fields/field";
import {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
} from "@/features/employees/employee.api";
import { getEmployeeFullName } from "../employee.model";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useMergedOptions } from "@/components/fields/use-merged-options";
import type { EmployeeResponseDto } from "@/features/employees/employee.dto";

type EmployeeAutocompleteFieldProps = Omit<FieldProps, "children"> & {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  status?: "ACTIVE" | "INACTIVE" | "ALL";
  disabled?: boolean;
};

// Mapper function defined outside to be stable
const mapEmployeeToOption = (employee: EmployeeResponseDto): AsyncOption => ({
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
});

export const EmployeeAutocompleteField = ({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  empty,
  status = "ACTIVE",
  disabled,
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

  // Fetch selected employee by ID if value is provided
  const { data: selectedEmployee } = useGetEmployeeQuery(value || "", {
    skip: !value || employees.some((e) => e.id === value),
  });

  const options = useMergedOptions({
    items: employees,
    selectedItem: selectedEmployee,
    mapOption: mapEmployeeToOption,
  });

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
      disabled={disabled}
    />
  );
};
