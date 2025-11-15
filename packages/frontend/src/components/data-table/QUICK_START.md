# DataTable v2.0 - Quick Start Guide

## 🚀 Начало работы за 5 минут

### Шаг 1: Импорт компонентов

```tsx
import { DataTable, DataTableToolbar } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
```

### Шаг 2: Определите тип данных

```tsx
type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
};
```

### Шаг 3: Создайте колонки

```tsx
const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "lastName",
    header: "Фамилия",
  },
  {
    accessorKey: "firstName",
    header: "Имя",
  },
  {
    accessorKey: "phone",
    header: "Телефон",
  },
  {
    accessorKey: "status",
    header: "Статус",
  },
];
```

### Шаг 4: Используйте DataTable

#### Вариант A: Простая таблица (Client-Side)

```tsx
export function PatientsTable({ patients }: { patients: Patient[] }) {
  return <DataTable columns={columns} data={patients} enableSorting />;
}
```

#### Вариант B: С поиском и фильтрами

```tsx
export function PatientsTable({ patients }: { patients: Patient[] }) {
  return (
    <DataTable
      columns={columns}
      data={patients}
      enableSorting
      enableFiltering
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchKey="lastName"
          searchPlaceholder="Поиск по фамилии..."
          filters={[
            {
              column: "status",
              title: "Статус",
              options: [
                { label: "Активен", value: "ACTIVE" },
                { label: "Неактивен", value: "INACTIVE" },
              ],
            },
          ]}
        />
      )}
    />
  );
}
```

#### Вариант C: Server-Side с пагинацией

```tsx
export function PatientsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useGetPatientsQuery({ page, limit });

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
    />
  );
}
```

## 🎯 Основные Props

| Prop              | Тип           | Описание                  |
| ----------------- | ------------- | ------------------------- |
| `columns`         | `ColumnDef[]` | Определения колонок       |
| `data`            | `T[]`         | Массив данных             |
| `isLoading`       | `boolean`     | Показать loading skeleton |
| `enableSorting`   | `boolean`     | Client-side сортировка    |
| `enableFiltering` | `boolean`     | Client-side фильтрация    |
| `pagination`      | `object`      | Server-side пагинация     |
| `toolbar`         | `function`    | Кастомный toolbar         |

## 💡 Полезные паттерны

### Форматирование валюты

```tsx
{
  accessorKey: "amount",
  header: "Сумма",
  cell: ({ row }) => {
    const amount = row.getValue("amount") as number;
    return `${amount.toLocaleString()} сум`;
  },
}
```

### Форматирование даты

```tsx
{
  accessorKey: "createdAt",
  header: "Дата",
  cell: ({ row }) => {
    const date = row.getValue("createdAt") as Date;
    return new Date(date).toLocaleDateString("ru-RU");
  },
}
```

### Badge для статусов

```tsx
import { Badge } from "@/components/ui/badge";

{
  accessorKey: "status",
  header: "Статус",
  cell: ({ row }) => {
    const status = row.getValue("status") as string;
    return <Badge variant={status === "PAID" ? "default" : "secondary"}>{status}</Badge>;
  },
}
```

### Row Actions

```tsx
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

{
  id: "actions",
  cell: ({ row }) => {
    const item = row.original;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(item)}>
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDelete(item)}>
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
}
```

## 📖 Дальнейшее изучение

- **README.md** - Полная документация
- **EXAMPLES.md** - 8 практических примеров
- **MIGRATION_GUIDE.md** - Руководство по миграции

## ⚡ Быстрые ссылки

- [TanStack Table Docs](https://tanstack.com/table/v8)
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table)

---

**Готовы начать? Скопируйте любой пример выше и адаптируйте под свои данные!** 🚀
