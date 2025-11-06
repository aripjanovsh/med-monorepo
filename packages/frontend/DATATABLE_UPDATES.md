# DataTable Updates - Ноябрь 2024

## 🎉 Новые возможности

### 1. Встроенный Debounce в useDataTableState

Теперь не нужно вручную создавать debounce для поиска - он встроен в хук!

#### До:
```tsx
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  setters.setSearch(debouncedSearch);
}, [debouncedSearch]);
```

#### После:
```tsx
const { queryParams, handlers, values } = useDataTableState({
  searchDebounceMs: 500, // опционально, по умолчанию 500ms
});

<DataTableToolbar
  searchValue={values.searchImmediate}
  onSearchChange={handlers.search.onChange}
/>
```

**Как это работает:**
- `values.searchImmediate` - мгновенное значение для input
- `values.search` - debounced значение для API (автоматически)
- Автоматический сброс на page 1 при изменении поиска

### 2. Универсальные компоненты Empty/Error State

Два новых компонента для красивого отображения пустых состояний и ошибок.

#### DataTableEmptyState

```tsx
import { DataTableEmptyState } from "@/components/data-table";

<DataTable
  emptyState={
    <DataTableEmptyState
      title="Сотрудники не найдены"
      description="Попробуйте изменить параметры поиска"
    />
  }
/>
```

**Props:**
- `title` - заголовок
- `description` - описание
- `icon` - кастомная иконка (lucide-react)
- `action` - дополнительное действие (кнопка)

#### DataTableErrorState

```tsx
import { DataTableErrorState } from "@/components/data-table";

<DataTable
  emptyState={
    error ? (
      <DataTableErrorState
        title="Ошибка при загрузке"
        error={error}
        onRetry={refetch}
      />
    ) : (
      <DataTableEmptyState />
    )
  }
/>
```

**Props:**
- `title` - заголовок
- `description` - описание (или извлекается из error)
- `error` - объект ошибки
- `icon` - кастомная иконка
- `onRetry` - callback для retry
- `retryText` - текст кнопки retry

### 3. Исправление пагинации

- ✅ Исправлен текст "Страница i из n" → "Страница 1 из 10"
- ✅ Корректная работа пагинации через handlers
- ✅ Правильный расчет количества страниц

### 4. defaultColumn в DataTable

Теперь все колонки по умолчанию имеют:
```tsx
{
  enableSorting: false,
  enableHiding: false,
}
```

Включайте только там где нужно:
```tsx
{
  accessorKey: "firstName",
  header: "Имя",
  enableSorting: true,  // ✅ явно включаем
}
```

## 📚 Обновленная документация

- `/hooks/use-data-table-state.md` - добавлена секция про debounce
- `/components/data-table/DATA_TABLE_STATES.md` - полная документация по Empty/Error states

## 🔧 Миграция

### Если используете ручной debounce

**Было:**
```tsx
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  setters.setSearch(debouncedSearch);
}, [debouncedSearch, setters]);

<DataTableToolbar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
/>
```

**Стало:**
```tsx
const { queryParams, handlers, values } = useDataTableState({
  searchDebounceMs: 500,
});

<DataTableToolbar
  searchValue={values.searchImmediate}
  onSearchChange={handlers.search.onChange}
/>
```

### Если используете кастомный empty/error state

**Было:**
```tsx
emptyState={
  error ? (
    <div className="text-center py-12">
      <p className="text-red-500">Ошибка</p>
      <Button onClick={refetch}>Повторить</Button>
    </div>
  ) : (
    "Нет данных"
  )
}
```

**Стало:**
```tsx
import { DataTableEmptyState, DataTableErrorState } from "@/components/data-table";

emptyState={
  error ? (
    <DataTableErrorState
      title="Ошибка при загрузке"
      error={error}
      onRetry={refetch}
    />
  ) : (
    <DataTableEmptyState
      title="Нет данных"
      description="Попробуйте изменить фильтры"
    />
  )
}
```

## ✅ Примеры обновлены

- `/app/cabinet/employees/page.tsx` - использует все новые возможности

## 🎯 Следующие шаги

Рекомендуется обновить другие страницы:
1. Patients page
2. Invoices page
3. Visits page

Используйте employees page как reference!

---

**Дата:** Ноябрь 7, 2024  
**Версия:** 2.1.0
