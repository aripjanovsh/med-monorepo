import type { ReactElement } from "react";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AsyncComboboxField,
  type AsyncOption,
} from "@/components/fields/async-combobox-field";
import type { FieldProps } from "@/components/fields/field";
import { useGetServicesQuery } from "@/features/master-data/master-data-services.api";
import type { Service } from "@/features/master-data/master-data.types";

type ServiceAutocompleteFieldProps = Omit<FieldProps, "children"> & {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  onServiceSelected?: (service: Service) => void;
  filterIsActive?: boolean;
};

export const ServiceAutocompleteField = ({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  empty,
  onServiceSelected,
  filterIsActive = true,
  ...fieldProps
}: ServiceAutocompleteFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetServicesQuery({
    search,
    limit: 50,
    isActive: filterIsActive,
  });

  const services = data?.data ?? [];

  const options: AsyncOption[] = useMemo(() => {
    return services.map((service) => ({
      label: `${service.name}`,
      value: service.id,
    }));
  }, [services]);

  const loadOptions = useCallback(async (searchValue: string) => {
    setSearch(searchValue);
  }, []);

  const handleChange = useCallback(
    (selectedValue: string | undefined) => {
      onChange(selectedValue);

      if (selectedValue && onServiceSelected) {
        const selectedService = services.find((s) => s.id === selectedValue);
        if (selectedService) {
          onServiceSelected(selectedService);
        }
      }
    },
    [onChange, onServiceSelected, services]
  );

  return (
    <AsyncComboboxField
      {...fieldProps}
      value={value}
      onChange={handleChange}
      options={options}
      loading={isLoading}
      loadOptions={loadOptions}
      placeholder={placeholder ?? t("Выберите услугу")}
      searchPlaceholder={searchPlaceholder ?? t("Поиск услуги...")}
      empty={empty ?? t("Услуги не найдены")}
    />
  );
};
