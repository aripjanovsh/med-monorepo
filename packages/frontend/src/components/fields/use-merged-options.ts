import { useMemo } from "react";
import type { AsyncOption } from "./async-combobox-field";

interface UseMergedOptionsProps<T> {
  items: T[];
  selectedItem?: T;
  recentlyCreatedItem?: T | null;
  mapOption: (item: T) => AsyncOption;
}

export function useMergedOptions<T extends { id: string }>({
  items,
  selectedItem,
  recentlyCreatedItem,
  mapOption,
}: UseMergedOptionsProps<T>): AsyncOption[] {
  return useMemo(() => {
    const options = items.map(mapOption);
    let merged = [...options];

    // Helper to check existence in original list
    const existsInItems = (id: string) => items.some((i) => i.id === id);

    // Add recently created item if it exists and isn't in method list
    if (recentlyCreatedItem && !existsInItems(recentlyCreatedItem.id)) {
      merged = [mapOption(recentlyCreatedItem), ...merged];
    }

    // Add selected item if it exists, isn't in original list, and different from recently created
    if (
      selectedItem &&
      !existsInItems(selectedItem.id) &&
      selectedItem.id !== recentlyCreatedItem?.id
    ) {
      merged = [mapOption(selectedItem), ...merged];
    }

    return merged;
  }, [items, selectedItem, recentlyCreatedItem, mapOption]);
}
