"use client";

import type { DataTableModel } from "@/components/data-table/data-table.model";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

type ColumnMeta = {
  className?: string;
  headerClassName?: string;
};

export function DataTable<TData, TValue>({
  columns = [],
  data = [],
  isLoading = false,
  sort,
  pagination,
  hidePagination = false,
  enableSorting = false,
  enableFiltering = false,
  defaultSorting = [],
  defaultFilters = [],
  selection,
  toolbar,
  emptyState = "No results.",
  onRowClick,
}: DataTableModel<TData, TValue>) {
  // State management
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(defaultFilters);

  // Determine if client-side mode is enabled
  const isClientSide = enableSorting || enableFiltering;

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      ...(enableSorting && { sorting }),
      ...(enableFiltering && { columnFilters }),
    },
    enableRowSelection: !!selection?.enable,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    ...(enableSorting && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),
    ...(enableFiltering && {
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(isClientSide &&
      !pagination && {
        getPaginationRowModel: getPaginationRowModel(),
      }),
    getCoreRowModel: getCoreRowModel(),
    manualSorting: !enableSorting,
    manualFiltering: !enableFiltering,
    manualPagination: !!pagination,
    defaultColumn: {
      enableSorting: false,
      enableHiding: false,
    },
  });

  useEffect(() => {
    if (selection?.onChange) {
      selection.onChange(rowSelection);
    }
  }, [rowSelection, selection?.onChange]);

  return (
    <div className="space-y-4">
      {toolbar && toolbar(table)}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnMeta =
                    (header.column.columnDef.meta as ColumnMeta | undefined) ||
                    {};
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={
                        columnMeta.headerClassName ?? columnMeta.className
                      }
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      <DataTableColumnHeader
                        header={header}
                        sort={sort}
                        className={
                          columnMeta.headerClassName ?? columnMeta.className
                        }
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columns={columns.length} rows={10} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    // Don't trigger row click if clicking on interactive elements
                    const target = e.target as HTMLElement;
                    const isInteractive = target.closest(
                      'a, button, [role="button"], input, select, textarea, [data-no-row-click]'
                    );
                    if (isInteractive) return;

                    onRowClick?.(row);
                  }}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnMeta =
                      (cell.column.columnDef.meta as ColumnMeta | undefined) ||
                      {};
                    return (
                      <TableCell key={cell.id} className={columnMeta.className}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!hidePagination && (
        <DataTablePagination pagination={pagination} table={table} />
      )}
    </div>
  );
}

const DataTableSkeleton = ({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
