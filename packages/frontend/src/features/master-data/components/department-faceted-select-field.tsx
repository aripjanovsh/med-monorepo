import { useMemo } from "react";

import {
  FacetedSelectField,
  type FacetedSelectOption,
} from "@/components/ui/faceted-select-field";
import { useGetDepartmentsQuery } from "@/features/master-data/master-data-departments.api";

type DepartmentFacetedSelectFieldProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  multiselect?: boolean;
};

export const DepartmentFacetedSelectField = ({
  value,
  onChange,
  multiselect = true,
}: DepartmentFacetedSelectFieldProps) => {
  const { data: departmentsData, isLoading } = useGetDepartmentsQuery({
    limit: 100,
    isActive: true,
  });

  const departmentOptions: FacetedSelectOption[] = useMemo(() => {
    if (!departmentsData?.data) return [];
    return departmentsData.data.map((dept) => ({
      label: dept.name,
      value: dept.id,
    }));
  }, [departmentsData]);

  if (isLoading || departmentOptions.length === 0) return null;

  return (
    <FacetedSelectField
      placeholder="Отделение"
      searchPlaceholder="Поиск отделения..."
      options={departmentOptions}
      value={value}
      onChange={onChange}
      multiselect={multiselect}
    />
  );
};
