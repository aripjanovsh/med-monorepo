import { useMemo } from "react";

import {
  FacetedSelectField,
  type FacetedSelectOption,
} from "@/components/ui/faceted-select-field";
import { PAYMENT_STATUS_LABELS } from "../service-order.constants";

type PaymentStatusFacetedSelectFieldProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  multiselect?: boolean;
};

export const PaymentStatusFacetedSelectField = ({
  value,
  onChange,
  multiselect = true,
}: PaymentStatusFacetedSelectFieldProps) => {
  const paymentStatusOptions: FacetedSelectOption[] = useMemo(() => {
    return Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => ({
      label,
      value: key,
    }));
  }, []);

  return (
    <FacetedSelectField
      placeholder="Статус оплаты"
      searchPlaceholder="Поиск статуса оплаты..."
      options={paymentStatusOptions}
      value={value}
      onChange={onChange}
      multiselect={multiselect}
    />
  );
};
