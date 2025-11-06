import type {
  ColumnDef,
  Row,
  RowSelectionState,
  SortingState,
  ColumnFiltersState,
  Table,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

export interface DataTableModel<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  isLoading?: boolean;
  
  // Server-side features
  sort?: DataTableSortModel;
  pagination?: DataTablePaginationModel;
  
  // Client-side features (optional - if provided, enables client-side mode)
  enableSorting?: boolean;
  enableFiltering?: boolean;
  defaultSorting?: SortingState;
  defaultFilters?: ColumnFiltersState;
  
  // Common features
  selection?: DataTableSelectionModel;
  toolbar?: (table: Table<TData>) => ReactNode;
  emptyState?: ReactNode;
  
  // Row actions
  onRowClick?: (row: Row<TData>) => void;
}

export interface DataTableToolbarModel<TData> {
  table: Table<TData>;
  search?: DataTableToolbarSearch;
  filters?: DataTableToolbarFilterItem[];
  reset?: DataTableToolbarReset;
}

export interface DataTableToolbarSearch {
  value?: string;
  onChange?: (value: string) => void;
}

export interface DataTableToolbarFilterItem {
  column: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export interface DataTableToolbarReset {
  enable?: boolean;
  onReset?: () => void;
}

export interface DataTableSortModel {
  value?: string[];
  multiple?: boolean;
  onChange?: (value: string[]) => void;
}

export interface DataTablePaginationModel {
  page?: number;
  limit?: number;
  total?: number;
  onChangePage?: (page: number) => void;
  onChangeLimit?: (limit: number) => void;
}

export interface DataTableSelectionModel {
  enable?: boolean;
  onChange?: (state: RowSelectionState) => void;
}

export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export interface DataTableFacetedFilterProps<TData, TValue> {
  column?: ReturnType<Table<TData>["getColumn"]>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}
