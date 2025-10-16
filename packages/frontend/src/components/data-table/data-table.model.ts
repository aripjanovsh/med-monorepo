import { ColumnDef, Row, RowSelectionState, Table, useReactTable } from '@tanstack/react-table';
import { ReactNode } from 'react';

export interface DataTableModel<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  isLoading?: boolean;
  sort?: DataTableSortModel;
  pagination?: DataTablePaginationModel;
  selection?: DataTableSelectionModel;
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => ReactNode;
  emptyState?: ReactNode;
}

export interface DataTableToolbarModel<TData> {
  table: Table<TData>;
  search?: DataTableToolbarSearch;
  filter?: DataTableToolbarFilter;
  reset?: DataTableToolbarReset;
}

export interface DataTableToolbarSearch {
  value?: string;
  onChange?: (value: string) => void;
}

export interface DataTableToolbarFilter {
  value?: Record<string, any>;
  onChange?: (name: string, value: string | number | string[] | number[]) => void;
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
