import type { ReactElement } from "react";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  AsyncComboboxField,
  type AsyncOption,
} from "@/components/fields/async-combobox-field";
import type { FieldProps } from "@/components/fields/field";
import { useDialog } from "@/lib/dialog-manager";
import {
  useGetPatientsQuery,
  useGetPatientQuery,
} from "@/features/patients/patient.api";
import type { PatientResponseDto } from "@/features/patients/patient.dto";
import { PatientFormSheet } from "./patient-form-sheet";
import { getPatientFullName, getPatientPrimaryPhone } from "../patient.model";
import { useMergedOptions } from "@/components/fields/use-merged-options";

type PatientAutocompleteFieldProps = Omit<FieldProps, "children"> & {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  enableQuickCreate?: boolean;
  createButtonText?: string;
  onPatientCreated?: (patient: PatientResponseDto) => void;
  disabled?: boolean;
};

// Mapper defined outside
const mapPatientToOption = (patient: PatientResponseDto): AsyncOption => {
  const fullName = getPatientFullName(patient);
  const phone = getPatientPrimaryPhone(patient);
  return {
    label: (
      <div>
        <p>
          {fullName}{" "}
          {phone ? (
            <span className="text-muted-foreground">({phone})</span>
          ) : (
            ""
          )}
        </p>
        <div className="text-sm text-muted-foreground">
          {patient.patientId || "Без ID"}
        </div>
      </div>
    ),
    displayLabel: fullName,
    value: patient.id,
  };
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
  disabled,
  ...fieldProps
}: PatientAutocompleteFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [recentlyCreatedPatient, setRecentlyCreatedPatient] =
    useState<PatientResponseDto | null>(null);
  const patientFormSheet = useDialog(PatientFormSheet);

  const { data, isLoading } = useGetPatientsQuery({
    search,
    limit: 20,
  });

  const patients = data?.data ?? [];

  // Fetch selected patient by ID if value is provided
  const { data: selectedPatient } = useGetPatientQuery(
    { id: value || "" },
    { skip: !value || patients.some((p) => p.id === value) }
  );

  const options = useMergedOptions({
    items: patients,
    selectedItem: selectedPatient,
    recentlyCreatedItem: recentlyCreatedPatient,
    mapOption: mapPatientToOption,
  });

  const loadOptions = useCallback(async (searchValue: string) => {
    setSearch(searchValue);
  }, []);

  const handleQuickCreateSuccess = useCallback(
    (patient?: PatientResponseDto) => {
      if (!patient) return;
      setRecentlyCreatedPatient(patient);
      onChange(patient.id);
      onPatientCreated?.(patient);
    },
    [onChange, onPatientCreated]
  );

  const handleCreate = useCallback(
    (searchValue: string) => {
      setSearch(searchValue);

      let defaultFirstName = "";
      let defaultLastName = "";
      let defaultPhone = "";

      // Check if search value looks like a phone number
      // Allow digits, spaces, plus, minus, parentheses
      // Must have at least 7 digits to be considered a phone number
      const isPhone =
        /^[\d+\-\(\)\s]+$/.test(searchValue) &&
        searchValue.replace(/\D/g, "").length >= 7;

      if (isPhone) {
        defaultPhone = searchValue;
      } else {
        // Parse into firstName and lastName
        const parts = searchValue.trim().split(/\s+/);
        // If multiple parts, assume first is lastName (common in CRM/Medical apps in CIS)
        // Adjust based on your locale preference if needed
        if (parts.length > 0) {
          defaultLastName = parts[0];
          if (parts.length > 1) {
            defaultFirstName = parts.slice(1).join(" ");
          }
        }
      }

      patientFormSheet.open({
        mode: "create",
        patientId: null,
        defaultFirstName,
        defaultLastName,
        defaultPhone,
        onSuccess: handleQuickCreateSuccess,
      });
    },
    [handleQuickCreateSuccess, patientFormSheet]
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
        canCreate={enableQuickCreate && !disabled}
        onCreate={handleCreate}
        createButtonText={createButtonText ?? t("Добавить пациента")}
        disabled={disabled}
      />
    </>
  );
};
