import { DataTablePaginationModel } from "@/components/data-table/data-table.model";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const LIMITS = [10, 20, 30, 40, 50];

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination?: DataTablePaginationModel;
}

export function DataTablePagination<TData>({
  table,
  pagination = {},
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();

  const page = pagination?.page || 1;
  const limit = pagination?.limit || LIMITS[0];
  const total = pagination?.total || 0;

  const count = Math.ceil(total / limit);
  const canNextPage = page < count;
  const canPreviousPage = page > 1;

  const firstRow = table.getCoreRowModel().rows[0];
  const canSelect = firstRow && firstRow.getCanSelect();

  const handleChangeLimit = (limit: string) => {
    if (pagination.onChangeLimit) pagination.onChangeLimit(Number(limit));
  };

  const handlePageChange = (newPage: number) => {
    if (pagination.onChangePage) pagination.onChangePage(newPage);
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {canSelect && (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        )}
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">{t("Строк на странице")}</div>
          <Select value={String(limit)} onValueChange={handleChangeLimit}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {LIMITS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          {t("Страница i из n", { page, count })}
        </div>
        {(canNextPage || canPreviousPage) && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(1)}
              disabled={!canPreviousPage}
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={!canPreviousPage}
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={!canNextPage}
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              onClick={() => handlePageChange(count)}
              disabled={!canNextPage}
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
