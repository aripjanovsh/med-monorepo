import type { ReactElement } from "react";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AsyncComboboxField,
  type AsyncOption,
} from "@/components/fields/async-combobox-field";
import type { FieldProps } from "@/components/fields/field";
import { useGetPatientsQuery } from "@/features/patients/patient.api";
import type { PatientResponseDto } from "@/features/patients/patient.dto";
import { PatientQuickCreateSheet } from "./patient-quick-create-sheet";

type PatientAutocompleteFieldProps = Omit<FieldProps, "children"> & {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  enableQuickCreate?: boolean;
  createButtonText?: string;
  onPatientCreated?: (patient: PatientResponseDto) => void;
};

export const PatientAutocompleteField = ({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  empty,
  enableQuickCreate = true,
  createButtonText,
  onPatientCreated,
  ...fieldProps
}: PatientAutocompleteFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [recentlyCreatedPatient, setRecentlyCreatedPatient] = useState<PatientResponseDto | null>(null);

  const { data, isLoading } = useGetPatientsQuery({
    search,
    limit: 20,
  });

  const patients = data?.data ?? [];

  const options: AsyncOption[] = useMemo(() => {
    const patientOptions = patients.map((patient) => ({
      label: `${patient.lastName} ${patient.firstName} ${patient.middleName || ""}`.trim(),
      value: patient.id,
    }));

    // Add recently created patient if not in the list
    if (recentlyCreatedPatient && !patients.some(p => p.id === recentlyCreatedPatient.id)) {
      return [
        {
          label: `${recentlyCreatedPatient.lastName} ${recentlyCreatedPatient.firstName} ${recentlyCreatedPatient.middleName || ""}`.trim(),
          value: recentlyCreatedPatient.id,
        },
        ...patientOptions,
      ];
    }

    return patientOptions;
  }, [patients, recentlyCreatedPatient]);

  const loadOptions = useCallback(async (searchValue: string) => {
    setSearch(searchValue);
  }, []);

  const handleCreate = useCallback((searchValue: string) => {
    setSearch(searchValue);
    setQuickCreateOpen(true);
  }, []);

  const handleQuickCreateSuccess = useCallback(
    (patient: PatientResponseDto) => {
      setRecentlyCreatedPatient(patient);
      onChange(patient.id);
      onPatientCreated?.(patient);
    },
    [onChange, onPatientCreated]
  );

  return (
    <>
      <AsyncComboboxField
        {...fieldProps}
        value={value}
        onChange={onChange}
        options={options}
        loading={isLoading}
        loadOptions={loadOptions}
        placeholder={placeholder ?? t("Выберите пациента")}
        searchPlaceholder={searchPlaceholder ?? t("Поиск пациента...")}
        empty={empty ?? t("Пациенты не найдены")}
        canCreate={enableQuickCreate}
        onCreate={handleCreate}
        createButtonText={createButtonText ?? t("Добавить пациента")}
      />

      {enableQuickCreate && (
        <PatientQuickCreateSheet
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
          onSuccess={handleQuickCreateSuccess}
          defaultSearch={search}
        />
      )}
    </>
  );
};
