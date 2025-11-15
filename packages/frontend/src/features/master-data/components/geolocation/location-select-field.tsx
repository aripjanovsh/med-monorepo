"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AsyncComboboxField,
  AsyncOption,
} from "@/components/fields/async-combobox-field";
import type { FieldProps } from "@/components/fields/field";
import {
  useLazySuggestLocationsQuery,
  useLazyGetLocationByIdQuery,
} from "@/features/master-data";
import type { Location, LocationType } from "@/features/master-data";

export type LocationHierarchyIds = {
  countryId?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  // convenience: which location item user actually selected
  selectedId?: string;
};

export interface LocationSelectFieldProps extends Omit<FieldProps, "children"> {
  value?: LocationHierarchyIds;
  onChange: (value: LocationHierarchyIds | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  empty?: string;
  limit?: number;
}

function shortTypeName(type: LocationType, name: string): string {
  switch (type) {
    case "CITY":
      return `${name}`;
    case "DISTRICT":
      return `${name}`;
    default:
      return name;
  }
}

function buildChainLabel(node: Partial<Location> | undefined): string {
  if (!node) return "";
  // Collect chain bottom-up via parent links if present
  const parts: string[] = [];
  let cur: any = node;
  while (cur) {
    if (cur.name && cur.type) {
      parts.push(shortTypeName(cur.type as LocationType, cur.name as string));
    } else if (cur.name) {
      parts.push(cur.name as string);
    }
    cur = cur.parent;
  }
  // We pushed bottom-up, need to reverse to Country -> ... -> Selected
  return parts.reverse().join(", ");
}

function computeHierarchyIds(
  node: Partial<Location> | undefined,
): LocationHierarchyIds {
  const result: LocationHierarchyIds = {};
  let cur: any = node;
  while (cur) {
    switch (cur.type as LocationType) {
      case "COUNTRY":
        result.countryId = cur.id;
        break;
      case "REGION":
        result.regionId = cur.id;
        break;
      case "CITY":
        result.cityId = cur.id;
        break;
      case "DISTRICT":
        result.districtId = cur.id;
        break;
    }
    cur = cur.parent;
  }
  if ((node as any)?.id) {
    result.selectedId = (node as any).id;
  }
  return result;
}

export function LocationSelectField({
  value,
  onChange,
  placeholder = "Выберите локацию",
  searchPlaceholder = "Начните вводить для поиска...",
  empty = "Локации не найдены",
  limit = 20,
  ...fieldProps
}: LocationSelectFieldProps) {
  const [options, setOptions] = useState<AsyncOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");

  // Map to store full Location objects for option ids
  const locationMapRef = useRef<Map<string, Location>>(new Map());

  const [triggerSuggest] = useLazySuggestLocationsQuery();
  const [triggerGetById] = useLazyGetLocationByIdQuery();

  const selectedId =
    value?.selectedId ||
    value?.districtId ||
    value?.cityId ||
    value?.regionId ||
    value?.countryId;

  const loadOptions = useCallback(
    async (search: string) => {
      setLoading(true);
      try {
        const { data } = await triggerSuggest(
          {
            q: search || "город Ташкент",
            limit,
            type: search ? undefined : "DISTRICT",
          },
          true,
        );
        const items = (data ?? []) as Location[];

        const nextOptions: AsyncOption[] = items.map((loc) => {
          // save to map for later retrieval
          locationMapRef.current.set(loc.id, loc);
          return {
            value: loc.id,
            label: buildChainLabel(loc),
          };
        });
        setOptions(nextOptions);
      } catch (e) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [limit, triggerSuggest],
  );

  // Ensure selected label is shown even if option not in current list
  useEffect(() => {
    let active = true;
    const ensureSelectedLabel = async () => {
      if (!selectedId) {
        setSelectedLabel("");
        return;
      }
      const cached = locationMapRef.current.get(selectedId);
      if (cached) {
        if (active) {
          setSelectedLabel(buildChainLabel(cached));
        }
        return;
      }
      try {
        const { data } = await triggerGetById(
          { id: selectedId, includeRelations: true },
          true,
        );
        if (!active) return;
        if (data) {
          locationMapRef.current.set(data.id, data as Location);
          setSelectedLabel(buildChainLabel(data as Location));
        }
      } catch (e) {
        if (!active) return;
        setSelectedLabel("");
      }
    };
    ensureSelectedLabel();
    return () => {
      active = false;
    };
  }, [selectedId, triggerGetById]);

  // Keep selected option available in options so the control can render its label
  useEffect(() => {
    if (!selectedId || !selectedLabel) return;
    setOptions((prev) => {
      if (prev.some((o) => o.value === selectedId)) return prev;
      return [{ value: selectedId, label: selectedLabel }, ...prev];
    });
  }, [selectedId, selectedLabel]);

  const handleChange = useCallback(
    (id: string | undefined) => {
      if (!id) {
        onChange?.(undefined);
        return;
      }
      const fromCache = locationMapRef.current.get(id);
      const apply = (node?: Location) => {
        if (!node) {
          onChange?.(undefined);
          return;
        }
        const ids = computeHierarchyIds(node);
        onChange?.(ids);
        setSelectedLabel(buildChainLabel(node));
      };

      if (fromCache) {
        apply(fromCache);
      } else {
        // fetch with relations to compute full chain
        triggerGetById({ id, includeRelations: true }, true)
          .then(({ data }) => apply(data as Location))
          .catch(() => onChange?.(undefined));
      }
    },
    [onChange, triggerGetById],
  );

  // Value for AsyncComboboxField should be selectedId
  const comboboxValue = useMemo(() => selectedId, [selectedId]);

  return (
    <AsyncComboboxField
      {...fieldProps}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      empty={empty}
      value={comboboxValue}
      onChange={handleChange}
      loadOptions={loadOptions}
      options={options}
      loading={loading}
      // Render option with checkmark handled by control; we just display the chain label
      renderOption={(option) => option.label}
    />
  );
}
