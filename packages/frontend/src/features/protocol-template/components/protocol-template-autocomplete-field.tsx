import type { ReactElement } from "react";
import { useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useGetProtocolTemplatesQuery } from "../protocol-template.api";
import type { ProtocolTemplateResponseDto } from "../protocol-template.dto";

type ProtocolTemplateAutocompleteFieldProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  onTemplateSelected?: (template: ProtocolTemplateResponseDto) => void;
  filterIsActive?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export const ProtocolTemplateAutocompleteField = ({
  value,
  onChange,
  placeholder = "Выберите шаблон протокола",
  searchPlaceholder = "Поиск шаблона...",
  empty = "Шаблоны не найдены",
  onTemplateSelected,
  filterIsActive = true,
  disabled = false,
  label,
  className,
}: ProtocolTemplateAutocompleteFieldProps): ReactElement => {
  const { data, isLoading } = useGetProtocolTemplatesQuery({
    page: 1,
    limit: 100,
    isActive: filterIsActive,
  });

  const templates = data?.data ?? [];

  const options = useMemo(() => {
    return templates.map((template) => ({
      label: template.name,
      value: template.id,
    }));
  }, [templates]);

  const handleChange = useCallback(
    (selectedValue: string) => {
      const newValue = selectedValue || undefined;
      onChange(newValue);

      if (selectedValue && onTemplateSelected) {
        const selectedTemplate = templates.find((t) => t.id === selectedValue);
        if (selectedTemplate) {
          onTemplateSelected(selectedTemplate);
        }
      }
    },
    [onChange, onTemplateSelected, templates]
  );

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <Combobox
        value={value}
        onValueChange={handleChange}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyText={empty}
        disabled={disabled || isLoading}
      />
    </div>
  );
};
