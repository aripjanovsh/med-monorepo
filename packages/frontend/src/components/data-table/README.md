# DataTable Component

Мощный и гибкий компонент таблицы, построенный на основе TanStack Table с поддержкой сортировки, фильтрации, пагинации и многого другого.

## Возможности

- ✅ **Loading Skeleton** - красивый скелетон во время загрузки
- ✅ **Pagination** - встроенная пагинация с выбором количества строк
- ✅ **Sorting** - client-side и server-side сортировка
- ✅ **Filtering** - client-side и server-side фильтрация
- ✅ **Column Visibility** - возможность скрывать/показывать колонки
- ✅ **Row Selection** - выбор строк с чекбоксами
- ✅ **Search** - поиск по таблице
- ✅ **Faceted Filters** - фильтры по категориям с подсчетом
- ✅ **Responsive** - адаптивный дизайн
- ✅ **TypeScript** - полная типизация

## Установка

Компонент уже установлен в проекте. Для использования импортируйте его:

```tsx
import { DataTable } from "@/components/data-table";
```

## Базовое использование

### 1. Server-Side Mode (рекомендуется для больших данных)

```tsx
"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string[]>([]);

  const { data, isLoading } = useGetUsersQuery({
    page,
    limit,
    search,
    sort,
  });

  return (
    <DataTable
      columns={columns}
      data={data?.items || []}
      isLoading={isLoading}
      pagination={{
        page,
        limit,
        total: data?.total || 0,
        onChangePage: setPage,
        onChangeLimit: setLimit,
      }}
      sort={{
        value: sort,
        onChange: setSort,
      }}
    />
  );
}
```

### 2. Client-Side Mode (для маленьких данных)

```tsx
"use client";

import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";

type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export function PaymentsTable({ data }: { data: Payment[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableFiltering
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchKey="email"
          searchPlaceholder="Search emails..."
          filters={[
            {
              column: "status",
              title: "Status",
              options: [
                { label: "Pending", value: "pending" },
                { label: "Processing", value: "processing" },
                { label: "Success", value: "success" },
                { label: "Failed", value: "failed" },
              ],
            },
          ]}
        />
      )}
    />
  );
}
```

## Расширенные примеры

### Row Actions

```tsx
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns: ColumnDef<User>[] = [
  // ... другие колонки
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(user)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(user)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
```

### Row Selection

```tsx
import { Checkbox } from "@/components/ui/checkbox";

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // ... другие колонки
];

<DataTable
  columns={columns}
  data={data}
  selection={{
    enable: true,
    onChange: (selection) => {
      console.log("Selected rows:", selection);
    },
  }}
/>;
```

### Custom Toolbar

```tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/data-table";

<DataTable
  columns={columns}
  data={data}
  enableFiltering
  toolbar={(table) => (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[250px]"
        />
        <Button variant="outline" onClick={() => table.resetColumnFilters()}>
          Reset Filters
        </Button>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )}
/>;
```

### Row Click Handler

```tsx
<DataTable
  columns={columns}
  data={data}
  onRowClick={(row) => {
    router.push(`/users/${row.original.id}`);
  }}
/>
```

## API Reference

### DataTable Props

| Prop              | Type                                 | Default        | Description                        |
| ----------------- | ------------------------------------ | -------------- | ---------------------------------- |
| `columns`         | `ColumnDef<TData, TValue>[]`         | `[]`           | Определения колонок таблицы        |
| `data`            | `TData[]`                            | `[]`           | Данные таблицы                     |
| `isLoading`       | `boolean`                            | `false`        | Показывать loading skeleton        |
| `pagination`      | `DataTablePaginationModel`           | `undefined`    | Настройки пагинации (server-side)  |
| `sort`            | `DataTableSortModel`                 | `undefined`    | Настройки сортировки (server-side) |
| `enableSorting`   | `boolean`                            | `false`        | Включить client-side сортировку    |
| `enableFiltering` | `boolean`                            | `false`        | Включить client-side фильтрацию    |
| `defaultSorting`  | `SortingState`                       | `[]`           | Начальное состояние сортировки     |
| `defaultFilters`  | `ColumnFiltersState`                 | `[]`           | Начальные фильтры                  |
| `selection`       | `DataTableSelectionModel`            | `undefined`    | Настройки выбора строк             |
| `toolbar`         | `(table: Table<TData>) => ReactNode` | `undefined`    | Кастомный тулбар                   |
| `emptyState`      | `ReactNode`                          | `"No results"` | Сообщение при пустой таблице       |
| `onRowClick`      | `(row: Row<TData>) => void`          | `undefined`    | Обработчик клика на строку         |

### DataTablePaginationModel

| Prop            | Type                      | Description                  |
| --------------- | ------------------------- | ---------------------------- |
| `page`          | `number`                  | Текущая страница             |
| `limit`         | `number`                  | Количество строк на странице |
| `total`         | `number`                  | Общее количество записей     |
| `onChangePage`  | `(page: number) => void`  | Коллбек изменения страницы   |
| `onChangeLimit` | `(limit: number) => void` | Коллбек изменения лимита     |

### DataTableSortModel

| Prop       | Type                        | Description                        |
| ---------- | --------------------------- | ---------------------------------- |
| `value`    | `string[]`                  | Массив сортируемых колонок         |
| `multiple` | `boolean`                   | Разрешить множественную сортировку |
| `onChange` | `(value: string[]) => void` | Коллбек изменения сортировки       |

## Советы и Best Practices

### 1. Используйте Server-Side для больших данных

Для таблиц с большим количеством данных (>100 записей) используйте server-side pagination, sorting и filtering:

```tsx
<DataTable
  columns={columns}
  data={data}
  pagination={{ ... }}
  sort={{ ... }}
/>
```

### 2. Используйте Client-Side для маленьких данных

Для небольших таблиц (<100 записей) используйте client-side режим:

```tsx
<DataTable columns={columns} data={data} enableSorting enableFiltering />
```

### 3. Мемоизируйте колонки

Используйте `useMemo` для колонок, чтобы избежать лишних ре-рендеров:

```tsx
const columns = useMemo<ColumnDef<User>[]>(
  () => [
    {
      accessorKey: "name",
      header: "Name",
    },
    // ...
  ],
  [],
);
```

### 4. Используйте DataTableToolbar

Вместо кастомного toolbar используйте готовый `DataTableToolbar`:

```tsx
import { DataTableToolbar } from "@/components/data-table";

<DataTable
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      searchKey="name"
      filters={[...]}
    />
  )}
/>
```

## Примеры из проекта

Примеры использования в проекте:

- `/app/cabinet/employees/page.tsx` - таблица сотрудников
- `/app/cabinet/patients/page.tsx` - таблица пациентов
- `/app/cabinet/invoices/page.tsx` - таблица счетов

## Troubleshooting

### Таблица не обновляется

Убедитесь, что вы передаете новый массив `data`, а не мутируете существующий:

```tsx
// ❌ Неправильно
data.push(newItem);

// ✅ Правильно
setData([...data, newItem]);
```

### Сортировка не работает

Проверьте, что вы используете правильный режим:

- Для server-side: передайте `sort` prop
- Для client-side: установите `enableSorting={true}`

### Фильтрация не работает

Убедитесь, что:

- Установлен `enableFiltering={true}` для client-side
- Колонка имеет правильный `accessorKey`
- Используете `DataTableToolbar` или кастомный toolbar с фильтрами
