import {
  ComboboxField,
  SingleComboboxFieldProps,
} from "@/components/fields/combobox-field";
import { get, map } from "lodash";
import { useTranslation } from "react-i18next";
import { useGetTitlesQuery } from "@/features/master-data/master-data-titles.api";

export type TitleSelectFieldProps = Omit<SingleComboboxFieldProps, "options">;

export function TitleSelectField({ ...props }: TitleSelectFieldProps) {
  const { t } = useTranslation();
  const { data } = useGetTitlesQuery({});

  const titles = get(data, "data", []);

  const options = map(titles, (title) => ({
    label: title.name,
    value: title.id,
  }));

  return (
    <ComboboxField
      {...props}
      options={options}
      placeholder={t("Выберите должность")}
      searchPlaceholder={t("Поиск должности...")}
      empty={t("Должности не найдены")}
    />
  );
}
