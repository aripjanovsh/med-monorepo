import type { DataTableSortModel } from "@/components/data-table/data-table.model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronsUpDown,
  EyeOff,
  X,
} from "lucide-react";
import type { HTMLAttributes } from "react";

interface DataTableColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  header: Header<TData, TValue>;
  sort?: DataTableSortModel;
}

export function DataTableColumnHeader<TData, TValue>({
  header,
  sort,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const ctx = flexRender(header.column.columnDef.header, header.getContext());
  const { column } = header;

  const canSort = column.getCanSort();
  const canHide = column.getCanHide();

  // Simple header without any actions
  if (!canSort && !canHide) {
    return <div className={cn("font-medium", className)}>{ctx}</div>;
  }

  // For client-side sorting (when no sort prop is provided)
  if (canSort && !sort) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
        onClick={() => {
          const isSorted = column.getIsSorted();
          if (isSorted === "asc") {
            column.toggleSorting(true);
          } else if (isSorted === "desc") {
            column.clearSorting();
          } else {
            column.toggleSorting(false);
          }
        }}
      >
        <span>{ctx}</span>
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2" />
        ) : (
          <ArrowUpDown className="ml-2" />
        )}
      </Button>
    );
  }

  const sortColumns = sort?.value || [];
  const [ascColumn, descColumn] = [`-${column.id}`, column.id];
  const isMultiple = !!sort?.multiple;

  const isColumnSorted = sortColumns.some(
    (col) => col === ascColumn || col === descColumn,
  );
  const isAscending = sortColumns.includes(ascColumn);

  const handleChange = (value: string[]) => {
    if (sort?.onChange) {
      sort.onChange(value);
    }
  };

  const handleSort = (columnId: string) => {
    const newColumns = sortColumns.filter(
      (col) => ![ascColumn, descColumn].includes(col),
    );
    if (isMultiple) {
      handleChange(
        sortColumns.includes(columnId) ? newColumns : [...newColumns, columnId],
      );
    } else {
      handleChange(sortColumns.includes(columnId) ? [] : [columnId]);
    }
  };

  // For server-side sorting (with sort prop)
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{ctx}</span>
            {isColumnSorted ? (
              isAscending ? (
                <ArrowUp className="ml-2" />
              ) : (
                <ArrowDown className="ml-2" />
              )
            ) : (
              <ChevronsUpDown className="ml-2" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {canSort && (
            <>
              <DropdownMenuItem
                onClick={() => handleSort(ascColumn)}
                className="group"
              >
                <ArrowUp className="size-3.5 text-muted-foreground/70" />
                Asc
                {isColumnSorted && isAscending && (
                  <>
                    <Check className="size-3.5 ml-auto text-muted-foreground/90 group-hover:hidden" />
                    <X className="size-3.5 ml-auto text-muted-foreground/90 hidden group-hover:inline" />
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort(descColumn)}
                className="group"
              >
                <ArrowDown className="size-3.5 text-muted-foreground/70" />
                Desc
                {isColumnSorted && !isAscending && (
                  <>
                    <Check className="size-3.5 ml-auto text-muted-foreground/90 group-hover:hidden" />
                    <X className="size-3.5 ml-auto text-muted-foreground/90 hidden group-hover:inline" />
                  </>
                )}
              </DropdownMenuItem>
            </>
          )}
          {canHide && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="size-3.5 text-muted-foreground/70" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
