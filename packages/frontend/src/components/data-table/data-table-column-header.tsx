import { DataTableSortModel } from '@/components/data-table/data-table.model';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { flexRender, Header } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Check, ChevronsUpDown, EyeOff, X } from 'lucide-react';
import { HTMLAttributes } from 'react';

interface DataTableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
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

  if (!canSort && !canHide) {
    return <div className={cn(className)}>{ctx}</div>;
  }

  const sortColumns = sort?.value || [];
  const [ascColumn, descColumn] = [`-${column.id}`, column.id];
  const isMultiple = !!sort?.multiple;

  const isColumnSorted = sortColumns.some((col) => col === ascColumn || col === descColumn);
  const isAscending = sortColumns.includes(ascColumn);

  const handleChange = (value: string[]) => {
    if (sort?.onChange) {
      sort.onChange(value);
    }
  };

  const handleSort = (columnId: string) => {
    const newColumns = sortColumns.filter((col) => ![ascColumn, descColumn].includes(col));
    if (isMultiple) {
      handleChange(sortColumns.includes(columnId) ? newColumns : [...newColumns, columnId]);
    } else {
      handleChange(sortColumns.includes(columnId) ? [] : [columnId]);
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span
            className="flex items-center gap-1 h-8 text-xs select-none [&_svg]:size-4"
            role="button"
          >
            <span>{ctx}</span>
            {isColumnSorted ? isAscending ? <ArrowUp /> : <ArrowDown /> : <ChevronsUpDown />}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {canSort && (
            <>
              <DropdownMenuItem onClick={() => handleSort(ascColumn)} className="group">
                <ArrowUp className="size-3.5 text-muted-foreground/70" />
                Asc
                {isColumnSorted && isAscending && (
                  <>
                    <Check className="size-3.5 ml-auto text-muted-foreground/90 group-hover:hidden" />
                    <X className="size-3.5 ml-auto text-muted-foreground/90 hidden group-hover:inline" />
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort(descColumn)} className="group">
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
