# useDataTableState Hook

Универсальный хук для управления состоянием DataTable (pagination, sorting, filtering).

## Возможности

- ✅ Управление пагинацией (page, limit)
- ✅ Управление сортировкой (server-side)
- ✅ Управление фильтрами (column filters)
- ✅ Управление поиском **со встроенным debounce**
- ✅ Автоматический сброс на первую страницу при изменении фильтров
- ✅ Поддержка двух форматов сортировки: `sort[]` и `sortBy/sortOrder`
- ✅ Готовые query params для RTK Query
- ✅ Встроенный debounce для search (настраиваемая задержка)

## Использование

### Базовый пример

```tsx
import { useDataTableState } from "@/hooks";
import { DataTable } from "@/components/data-table";
import { useGetEmployeesQuery } from "@/features/employees";

function EmployeesPage() {
  const { queryParams, handlers } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "firstName", desc: false }],
    sortFormat: "split", // sortBy/sortOrder format
  });

  const { data, isLoading } = useGetEmployeesQuery(queryParams);

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      isLoading={isLoading}
      pagination={{
        ...handlers.pagination,
        total: data?.meta?.total || 0,
      }}
      sort={handlers.sorting}
    />
  );
}
```

### С Toolbar и поиском

```tsx
import { DataTable, DataTableToolbar } from "@/components/data-table";
import { useDataTableState } from "@/hooks";

function UsersPage() {
  const { queryParams, handlers, tableState } = useDataTableState({
    defaultLimit: 20,
    sortFormat: "array", // Use sort: [] format
  });

  const { data, isLoading } = useGetUsersQuery(queryParams);

  return (
    <DataTable
      columns={columns}
      data={data?.items || []}
      isLoading={isLoading}
      pagination={{
        ...handlers.pagination,
        total: data?.total || 0,
      }}
      sort={handlers.sorting}
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchKey="name"
          searchPlaceholder="Поиск пользователей..."
        />
      )}
    />
  );
}
```

## API Reference

### Config

```typescript
interface DataTableStateConfigExtended {
  defaultPage?: number; // Default: 1
  defaultLimit?: number; // Default: 10
  defaultSorting?: SortingState; // Default: []
  defaultFilters?: ColumnFiltersState; // Default: []
  sortFormat?: "array" | "split"; // Default: "split"
  searchDebounceMs?: number; // Default: 500ms
}
```

#### searchDebounceMs

Задержка debounce для поиска в миллисекундах. По умолчанию 500ms.

```tsx
// Быстрый debounce (300ms)
const hook = useDataTableState({
  searchDebounceMs: 300,
});

// Медленный debounce (1000ms)
const hook = useDataTableState({
  searchDebounceMs: 1000,
});
```

#### sortFormat

- **`"split"`** (default): Генерирует `sortBy` и `sortOrder`

  ```typescript
  { sortBy: "firstName", sortOrder: "asc" }
  ```

- **`"array"`**: Генерирует массив `sort`
  ```typescript
  {
    sort: ["-firstName", "lastName"];
  }
  ```

### Return Value

```typescript
{
  // Для RTK Query
  queryParams: {
    page: number;
    limit: number;
    sortBy?: string;           // если sortFormat="split"
    sortOrder?: "asc" | "desc"; // если sortFormat="split"
    sort?: string[];           // если sortFormat="array"
    search?: string;
    filters?: Record<string, unknown>;
  },

  // Для DataTable компонента
  tableState: {
    page: number;
    limit: number;
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    search: string;
  },

  // Handlers для DataTable
  handlers: {
    pagination: {
      page: number;
      limit: number;
      onChangePage: (page: number) => void;
      onChangeLimit: (limit: number) => void;
    },
    sorting: {
      value: string[];
      onChange: (sort: string[]) => void;
    },
    search: {
      value: string;
      onChange: (search: string) => void;
    },
    filters: {
      value: ColumnFiltersState;
      onChange: (filters: ColumnFiltersState) => void;
    },
    reset: () => void; // Сброс всех состояний
  },

  // Прямые setters (для продвинутого использования)
  setters: {
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSorting: (sorting: SortingState) => void;
    setColumnFilters: (filters: ColumnFiltersState) => void;
    setSearch: (search: string) => void;
    setSearchImmediate: (search: string) => void; // Для input без debounce
    setDebouncedValue: (key: "search", value: string) => void; // Универсальный setter
  },

  // Current state values
  values: {
    page: number;
    limit: number;
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    search: string;              // Debounced search value (используется в API)
    searchImmediate: string;     // Immediate search value (для input)
  }
}
```

## Примеры

### 1. Базовая таблица с пагинацией

```tsx
const { queryParams, handlers } = useDataTableState();

const { data, isLoading } = useGetItemsQuery(queryParams);

<DataTable
  data={data?.items}
  pagination={{
    ...handlers.pagination,
    total: data?.total,
  }}
/>;
```

### 2. С сортировкой (split format)

```tsx
const { queryParams, handlers } = useDataTableState({
  defaultSorting: [{ id: "createdAt", desc: true }],
  sortFormat: "split",
});

// queryParams будет содержать:
// { page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" }

const { data } = useGetItemsQuery(queryParams);

<DataTable
  data={data?.items}
  sort={handlers.sorting}
  pagination={{
    ...handlers.pagination,
    total: data?.total,
  }}
/>;
```

### 3. С сортировкой (array format)

```tsx
const { queryParams, handlers } = useDataTableState({
  defaultSorting: [
    { id: "priority", desc: true },
    { id: "createdAt", desc: false },
  ],
  sortFormat: "array",
});

// queryParams будет содержать:
// { page: 1, limit: 10, sort: ["priority", "-createdAt"] }
```

### 4. С фильтрами

```tsx
const { queryParams, handlers, tableState } = useDataTableState({
  defaultFilters: [
    { id: "status", value: "ACTIVE" },
  ],
});

// queryParams будет содержать:
// { page: 1, limit: 10, filters: { status: "ACTIVE" } }

const { data } = useGetItemsQuery(queryParams);

<DataTable
  data={data?.items}
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      filters={[
        {
          column: "status",
          title: "Статус",
          options: [...],
        },
      ]}
    />
  )}
/>
```

### 5. Сброс фильтров

```tsx
const { queryParams, handlers } = useDataTableState();

<Button onClick={handlers.reset}>Сбросить все фильтры</Button>;
```

### 6. Прямое управление state

```tsx
const { setters } = useDataTableState();

// Установить конкретную страницу
setters.setPage(5);

// Установить поиск
setters.setSearch("John");

// Установить сортировку
setters.setSorting([{ id: "name", desc: false }]);
```

## Поведение

### Автоматический сброс страницы

Хук автоматически сбрасывает на первую страницу при изменении:

- Поиска
- Сортировки
- Фильтров
- Лимита записей на странице

Это обеспечивает корректное UX поведение.

```tsx
// Пользователь на странице 5, устанавливает фильтр
// → автоматически переходит на страницу 1
```

## Интеграция с RTK Query

Хук идеально интегрируется с RTK Query:

```typescript
// В API
export interface QueryParamsDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// В компоненте
const { queryParams } = useDataTableState({ sortFormat: "split" });
const { data } = useGetItemsQuery(queryParams);
```

## Совместимость с разными API форматами

### Format 1: sortBy + sortOrder (NestJS standard)

```typescript
const { queryParams } = useDataTableState({ sortFormat: "split" });
// → { sortBy: "name", sortOrder: "asc" }
```

### Format 2: sort array

```typescript
const { queryParams } = useDataTableState({ sortFormat: "array" });
// → { sort: ["-name", "createdAt"] }
```

## Best Practices

1. **Используйте правильный sortFormat**

   ```typescript
   // Для API с sortBy/sortOrder
   sortFormat: "split";

   // Для API с sort: []
   sortFormat: "array";
   ```

2. **Мемоизируйте handlers**

   ```typescript
   const { handlers } = useDataTableState();
   // handlers уже стабильны, мемоизация не нужна
   ```

3. **Spread pagination handlers**

   ```typescript
   pagination={{
     ...handlers.pagination, // включает page, limit, onChange
     total: data?.total,      // добавляем total из API
   }}
   ```

4. **Используйте queryParams напрямую в RTK Query**
   ```typescript
   const { queryParams } = useDataTableState();
   const { data } = useGetItemsQuery(queryParams);
   ```

## Примеры из проекта

- **Employees Page**: `/app/cabinet/employees/page.tsx`
- Полная интеграция с всеми фичами

---

**Версия:** 1.0.0  
**Статус:** ✅ Готов к использованию
