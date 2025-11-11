import { useMemo } from "react";

import {
  FacetedSelectField,
  type FacetedSelectOption,
} from "@/components/ui/faceted-select-field";
import { ORDER_STATUS_LABELS } from "../service-order.constants";

type StatusFacetedSelectFieldProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  multiselect?: boolean;
};

export const StatusFacetedSelectField = ({
  value,
  onChange,
  multiselect = true,
}: StatusFacetedSelectFieldProps) => {
  const statusOptions: FacetedSelectOption[] = useMemo(() => {
    return Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => ({
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
