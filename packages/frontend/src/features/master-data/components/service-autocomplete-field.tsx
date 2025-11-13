import type { ReactElement } from "react";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AsyncComboboxField,
  type AsyncOption,
} from "@/components/fields/async-combobox-field";
import type { FieldProps } from "@/components/fields/field";
import { useGetServicesQuery } from "@/features/master-data/master-data-services.api";

type ServiceAutocompleteFieldProps = Omit<FieldProps, "children"> & {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  isActive?: boolean;
};

export const ServiceAutocompleteField = ({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  empty,
  isActive = true,
  ...fieldProps
}: ServiceAutocompleteFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetServicesQuery({
    search,
    limit: 20,
    isActive,
  });

  const services = data?.data ?? [];

  const options: AsyncOption[] = useMemo(() => {
    return services.map((service) => ({
      label: `${service.name}${service.price ? ` (${service.price.toLocaleString()} сум)` : ""}`,
      value: service.id,
    }));
  }, [services]);

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
      placeholder={placeholder ?? t("Выберите услугу")}
      searchPlaceholder={searchPlaceholder ?? t("Поиск услуги...")}
      empty={empty ?? t("Услуги не найдены")}
    />
  );
};
