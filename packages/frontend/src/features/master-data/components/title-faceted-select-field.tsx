import { useMemo } from "react";

import {
  FacetedSelectField,
  type FacetedSelectOption,
} from "@/components/ui/faceted-select-field";
import { useGetTitlesQuery } from "@/features/master-data/master-data-titles.api";

type TitleFacetedSelectFieldProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  multiselect?: boolean;
};

export const TitleFacetedSelectField = ({
  value,
  onChange,
  multiselect = true,
}: TitleFacetedSelectFieldProps) => {
  const { data: titlesData, isLoading } = useGetTitlesQuery({
    limit: 100,
    isActive: true,
  });

  const titleOptions: FacetedSelectOption[] = useMemo(() => {
    if (!titlesData?.data) return [];
    return titlesData.data.map((title) => ({
      label: title.name,
      value: title.id,
    }));
  }, [titlesData]);

  if (isLoading || titleOptions.length === 0) return null;

  return (
    <FacetedSelectField
      placeholder="Должность"
      searchPlaceholder="Поиск должности..."
      options={titleOptions}
      value={value}
      onChange={onChange}
      multiselect={multiselect}
    />
  );
};
