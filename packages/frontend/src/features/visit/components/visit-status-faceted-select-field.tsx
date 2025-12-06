import { useMemo } from "react";

import {
  FacetedSelectField,
  type FacetedSelectOption,
} from "@/components/ui/faceted-select-field";
import { VISIT_STATUS_LABELS } from "../visit.constants";

type VisitStatusFacetedSelectFieldProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  multiselect?: boolean;
};

export const VisitStatusFacetedSelectField = ({
  value,
  onChange,
  multiselect = true,
}: VisitStatusFacetedSelectFieldProps) => {
  const statusOptions: FacetedSelectOption[] = useMemo(() => {
    return Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => ({
      label,
      value: key,
    }));
  }, []);

  return (
    <FacetedSelectField
      placeholder="Статус"
      searchPlaceholder="Поиск статуса..."
      options={statusOptions}
      value={value}
      onChange={onChange}
      multiselect={multiselect}
    />
  );
};
