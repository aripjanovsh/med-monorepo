import { useMemo } from "react";
import { Combobox } from "@/components/ui/combobox";
import { useGetEmployeesQuery } from "../employee.api";
import { getEmployeeFullName } from "../employee.model";

type EmployeeSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const EmployeeSelect = ({
  value,
  onChange,
  placeholder = "Выберите врача",
  disabled = false,
  className,
}: EmployeeSelectProps) => {
  const { data, isLoading } = useGetEmployeesQuery({ limit: 100 });

  const options = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((employee) => ({
      value: employee.id,
      label: getEmployeeFullName(employee),
    }));
  }, [data]);

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Поиск врача..."
      emptyText="Врачи не найдены"
      disabled={disabled || isLoading}
      className={className}
    />
  );
};
