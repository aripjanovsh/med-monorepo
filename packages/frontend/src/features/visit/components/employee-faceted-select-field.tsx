import { useMemo } from "react";

import {
  FacetedSelectField,
  type FacetedSelectOption,
} from "@/components/ui/faceted-select-field";
import { useGetEmployeesQuery } from "@/features/employees/employee.api";
import { getEmployeeFullName } from "@/features/employees/employee.model";

type EmployeeFacetedSelectFieldProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  multiselect?: boolean;
  placeholder?: string;
};

export const EmployeeFacetedSelectField = ({
  value,
  onChange,
  multiselect = true,
  placeholder = "Врач",
}: EmployeeFacetedSelectFieldProps) => {
  const { data, isLoading } = useGetEmployeesQuery({
    limit: 100,
    status: "ACTIVE",
  });

  const employeeOptions: FacetedSelectOption[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((employee) => ({
      label: getEmployeeFullName(employee),
      value: employee.id,
    }));
  }, [data?.data]);

  if (isLoading || employeeOptions.length === 0) {
    return null;
  }

  return (
    <FacetedSelectField
      placeholder={placeholder}
      searchPlaceholder="Поиск врача..."
      options={employeeOptions}
      value={value}
      onChange={onChange}
      multiselect={multiselect}
    />
  );
};
