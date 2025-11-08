import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useGetVisitsQuery } from "../visit.api";
import type { SavedProtocolData, FilledProtocolOption } from "../visit-protocol.types";
import { getEmployeeShortName } from "@/features/employees";

type PatientFilledProtocolAutocompleteFieldProps = {
  patientId: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  onProtocolSelected?: (option: FilledProtocolOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export const PatientFilledProtocolAutocompleteField = ({
  patientId,
  value,
  onChange,
  onProtocolSelected,
  placeholder = "Выберите ранее заполненный протокол",
  searchPlaceholder = "Поиск протокола...",
  empty = "Заполненные протоколы не найдены",
  disabled = false,
  label,
  className,
}: PatientFilledProtocolAutocompleteFieldProps): ReactElement => {
  const { data, isLoading } = useGetVisitsQuery({
    patientId,
    status: "COMPLETED",
    page: 1,
    limit: 50,
  });

  const visits = data?.data ?? [];

  // Фильтруем визиты которые имеют заполненные протоколы
  const filledProtocolOptions: FilledProtocolOption[] = useMemo(() => {
    return visits
      .filter((visit) => visit.protocolData && visit.protocol)
      .map((visit) => {
        try {
          const protocolData = JSON.parse(visit.protocolData!) as SavedProtocolData;
          return {
            visitId: visit.id,
            visitDate: visit.visitDate,
            templateName: visit.protocol!.name,
            doctorName: getEmployeeShortName(visit.employee),
            protocolData,
          };
        } catch {
          return null;
        }
      })
      .filter((option): option is FilledProtocolOption => option !== null);
  }, [visits]);

  const options = useMemo(() => {
    return filledProtocolOptions.map((option) => {
      const visitDateFormatted = format(parseISO(option.visitDate), "dd MMM yyyy", {
        locale: ru,
      });
      return {
        label: `${option.templateName} - ${visitDateFormatted} (${option.doctorName})`,
        value: option.visitId,
      };
    });
  }, [filledProtocolOptions]);

  const handleChange = useCallback(
    (selectedValue: string) => {
      const newValue = selectedValue || undefined;
      onChange(newValue);

      if (selectedValue && onProtocolSelected) {
        const selectedOption = filledProtocolOptions.find(
          (o) => o.visitId === selectedValue
        );
        if (selectedOption) {
          onProtocolSelected(selectedOption);
        }
      }
    },
    [onChange, onProtocolSelected, filledProtocolOptions]
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
