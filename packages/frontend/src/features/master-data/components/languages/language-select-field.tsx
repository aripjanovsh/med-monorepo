import {
  ComboboxField,
  SingleComboboxFieldProps,
} from "@/components/fields/combobox-field";
import { get, map } from "lodash";
import { useTranslation } from "react-i18next";
import { useGetLanguagesQuery } from "@/features/master-data/master-data-languages.api";

export type LanguageSelectFieldProps = Omit<
  SingleComboboxFieldProps,
  "options"
>;

export function LanguageSelectField({ ...props }: LanguageSelectFieldProps) {
  const { t } = useTranslation();
  const { data } = useGetLanguagesQuery({
    limit: 100,
  });

  const languages = get(data, "data", []);

  const options = map(languages, (language) => ({
    label: `${language.name} (${language.nativeName})`,
    value: language.id,
  }));

  return (
    <ComboboxField
      {...props}
      options={options}
      placeholder={t("Выберите язык")}
      searchPlaceholder={t("Поиск языка...")}
      empty={t("Языки не найдены")}
    />
  );
}
