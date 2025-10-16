import { SelectField, SelectFieldProps } from "./fields/select-field";

interface LanguageSelectFieldProps extends Omit<SelectFieldProps, "options"> {}

export function LanguageSelectField({ ...props }: LanguageSelectFieldProps) {
  return (
    <SelectField
      options={[
        { value: "uz", label: "Узбекский" },
        { value: "ru", label: "Русский" },
        { value: "en", label: "Английский" },
      ]}
      {...props}
    />
  );
}
