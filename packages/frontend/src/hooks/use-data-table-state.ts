import { useState, useCallback, useMemo, useEffect } from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export interface DataTableStateConfig {
  defaultPage?: number;
  defaultLimit?: number;
  defaultSorting?: SortingState;
  defaultFilters?: ColumnFiltersState;
  searchDebounceMs?: number;
}

export interface DataTableQueryParams {
  page: number;
  limit: number;
  sort?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, unknown>;
}

export type SortFormat = "array" | "split";

export interface DataTableStateConfigExtended extends DataTableStateConfig {
  sortFormat?: SortFormat;
}

/**
 * Universal hook for managing DataTable state (pagination, sorting, filtering)
 *
 * @example
 * const { queryParams, tableState, handlers } = useDataTableState({
 *   defaultLimit: 10,
 *   defaultSorting: [{ id: "lastName", desc: false }],
 * });
 *
 * const { data, isLoading } = useGetEmployeesQuery(queryParams);
 *
 * <DataTable
 *   {...tableState}
 *   data={data?.items}
 *   pagination={{
 *     ...handlers.pagination,
 *     total: data?.total,
 *   }}
 * />
 */
export function useDataTableState(config: DataTableStateConfigExtended = {}) {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    defaultSorting = [],
    defaultFilters = [],
    sortFormat = "split",
    searchDebounceMs = 500,
  } = config;

  // State
  const [page, setPage] = useState(defaultPage);
  const [limit, setLimit] = useState(defaultLimit);
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(defaultFilters);
  const [search, setSearch] = useState("");
  const [searchImmediate, setSearchImmediate] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchImmediate);
      setPage(1); // Reset to first page when search changes
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  }, [searchImmediate, searchDebounceMs]);

  // Convert TanStack sorting to API format
  // Example: [{ id: "lastName", desc: false }] -> ["-lastName"] or ["lastName"]
  const sortArray = useMemo(() => {
    return sorting.map((s) => (s.desc ? s.id : `-${s.id}`));
  }, [sorting]);

  // Convert column filters to API format
  const filtersObject = useMemo(() => {
    const result: Record<string, unknown> = {};

    columnFilters.forEach((filter) => {
      result[filter.id] = filter.value;
    });

    return result;
  }, [columnFilters]);

  // Query params for RTK Query
  const queryParams = useMemo<DataTableQueryParams>(() => {
    const params: DataTableQueryParams = {
      page,
      limit,
    };

    if (sortFormat === "array") {
      if (sortArray.length > 0) {
        params.sort = sortArray;
      }
    } else {
      if (sorting.length > 0) {
        const firstSort = sorting[0];
        params.sortBy = firstSort.id;
        params.sortOrder = firstSort.desc ? "desc" : "asc";
      }
    }

    if (search) {
      params.search = search;
    }

    if (Object.keys(filtersObject).length > 0) {
      params.filters = filtersObject;
    }

    return params;
  }, [page, limit, sortArray, sorting, search, filtersObject, sortFormat]);

  // Handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearchImmediate(newSearch);
  }, []);

  const setDebouncedValue = useCallback((key: "search", value: string) => {
    if (key === "search") {
      setSearchImmediate(value);
    }
  }, []);

  const handleSortChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1); // Reset to first page when sorting changes
  }, []);

  const handleFiltersChange = useCallback((newFilters: ColumnFiltersState) => {
    setColumnFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleReset = useCallback(() => {
    setPage(defaultPage);
    setLimit(defaultLimit);
    setSorting(defaultSorting);
    setColumnFilters(defaultFilters);
    setSearch("");
  }, [defaultPage, defaultLimit, defaultSorting, defaultFilters]);

  // Memoize setters object to prevent unnecessary re-renders
  const setters = useMemo(
    () => ({
      setPage,
      setLimit,
      setSorting,
      setColumnFilters,
      setSearch,
      setSearchImmediate,
      setDebouncedValue,
    }),
    [setDebouncedValue],
  );

  // Memoize values object
  const values = useMemo(
    () => ({
      page,
      limit,
      sorting,
      columnFilters,
      search,
      searchImmediate,
    }),
    [page, limit, sorting, columnFilters, search, searchImmediate],
  );

  // Memoize handlers object
  const handlers = useMemo(
    () => ({
      pagination: {
        page,
        limit,
        onChangePage: handlePageChange,
        onChangeLimit: handleLimitChange,
      },
      sorting: {
        value: sortArray,
        onChange: (newSort: string[]) => {
          // Convert API format back to TanStack format
          const newSorting = newSort.map((s) => ({
            id: s.startsWith("-") ? s.slice(1) : s,
            desc: !s.startsWith("-"),
          }));
          setSorting(newSorting);
        },
      },
      search: {
        value: search,
        onChange: handleSearchChange,
      },
      filters: {
        value: columnFilters,
        onChange: handleFiltersChange,
      },
      reset: handleReset,
    }),
    [
      page,
      limit,
      sortArray,
      search,
      columnFilters,
      handlePageChange,
      handleLimitChange,
      handleSearchChange,
      handleFiltersChange,
      handleReset,
    ],
  );

  // Return structured data
  return {
    // For RTK Query
    queryParams,

    // For DataTable component
    tableState: {
      page,
      limit,
      sorting,
      columnFilters,
      search,
    },

    // Handlers
    handlers,

    // Direct state setters (for advanced usage)
    setters,

    // Current state values
    values,
  };
}
