import {
  ComboboxField,
  SingleComboboxFieldProps,
} from "@/components/fields/combobox-field";
import { get, map } from "lodash";
import { useTranslation } from "react-i18next";
import { useGetServiceTypesQuery } from "@/features/master-data/master-data-service-types.api";

export type ServiceTypeSelectFieldProps = Omit<
  SingleComboboxFieldProps,
  "options"
>;

export function ServiceTypeSelectField({
  ...props
}: ServiceTypeSelectFieldProps) {
  const { t } = useTranslation();
  const { data } = useGetServiceTypesQuery({});

  const serviceTypes = get(data, "data", []);

  const options = map(serviceTypes, (serviceType) => ({
    label: serviceType.name,
    value: serviceType.id,
  }));

  return (
    <ComboboxField
      {...props}
      options={options}
      placeholder={t("Выберите тип услуги")}
      searchPlaceholder={t("Поиск типа услуги...")}
      empty={t("Типы услуг не найдены")}
    />
  );
}
