import { useMemo } from "react";

import {
  FacetedSelectField,
  type FacetedSelectOption,
} from "@/components/ui/faceted-select-field";
import { SERVICE_TYPE_LABELS } from "../service-order.constants";

type ServiceTypeFacetedSelectFieldProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  multiselect?: boolean;
};

export const ServiceTypeFacetedSelectField = ({
  value,
  onChange,
  multiselect = true,
}: ServiceTypeFacetedSelectFieldProps) => {
  const serviceTypeOptions: FacetedSelectOption[] = useMemo(() => {
    return Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => ({
      label,
      value: key,
    }));
  }, []);

  return (
    <FacetedSelectField
      placeholder="Тип услуги"
      searchPlaceholder="Поиск типа услуги..."
      options={serviceTypeOptions}
      value={value}
      onChange={onChange}
      multiselect={multiselect}
    />
  );
};
