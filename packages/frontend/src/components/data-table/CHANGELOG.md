# DataTable - Changelog

## v2.0.0 - Полное обновление (Ноябрь 2024)

### 🎉 Основные изменения

Компонент DataTable был полностью переработан на основе лучших практик shadcn/ui с добавлением всех современных функций.

### ✨ Новые возможности

#### 1. Client-Side режим
- **Client-side сортировка**: включается через `enableSorting={true}`
- **Client-side фильтрация**: включается через `enableFiltering={true}`
- **Client-side пагинация**: автоматически для небольших данных

```tsx
<DataTable
  columns={columns}
  data={data}
  enableSorting
  enableFiltering
/>
```

#### 2. DataTableToolbar - Unified Toolbar
Новый компонент для объединения search, filters и view options:

```tsx
<DataTable
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      searchKey="name"
      searchPlaceholder="Search..."
      filters={[...]}
    />
  )}
/>
```

#### 3. DataTableFacetedFilter - Категориальные фильтры
Фильтры с выпадающими списками, подсчетом и иконками:

```tsx
{
  column: "status",
  title: "Status",
  options: [
    { label: "Active", value: "active", icon: CheckCircle },
    { label: "Inactive", value: "inactive", icon: XCircle },
  ]
}
```

#### 4. Улучшенная сортировка колонок
- Автоматическое определение client-side vs server-side
- Три состояния: asc → desc → none
- Визуальные индикаторы с иконками
- Поддержка множественной сортировки

#### 5. Row Click Handler
```tsx
<DataTable
  onRowClick={(row) => {
    router.push(`/detail/${row.original.id}`);
  }}
/>
```

#### 6. Улучшенный Loading Skeleton
- Настраиваемое количество строк
- Более высокие skeleton строки (h-6 вместо h-4)
- Лучшая визуализация загрузки

### 🔧 Улучшения типизации

#### Обновленные типы в data-table.model.ts:
- `SortingState` - для client-side сортировки
- `ColumnFiltersState` - для client-side фильтрации
- `DataTableToolbarFilterItem` - для toolbar фильтров
- `DataTableFacetedFilterProps` - для faceted фильтров

### 📝 Новая документация

1. **README.md** - Полное руководство по использованию
   - Описание всех возможностей
   - API Reference
   - Best Practices
   - Troubleshooting

2. **EXAMPLES.md** - 8 практических примеров
   - Client-side таблица
   - Server-side таблица
   - Таблица с toolbar и filters
   - Row selection
   - Row actions
   - Custom cell formatting
   - Row click handler
   - Multiple filters

3. **CHANGELOG.md** - История изменений

### 🎨 Улучшения UI/UX

1. **Column Headers**
   - Кнопки вместо span для лучшего UX
   - Hover эффекты
   - Иконки сортировки (ArrowUp, ArrowDown, ArrowUpDown)
   - Data state для открытых dropdown

2. **Empty State**
   - Текст с muted-foreground цветом
   - Центрированный текст
   - Настраиваемое сообщение

3. **Row Hover**
   - Автоматический cursor-pointer при onRowClick
   - Hover effects на строках
   - Selected state visualization

### 📦 Новые файлы

```
data-table/
├── index.ts                          # ✨ НОВЫЙ - Централизованный экспорт
├── data-table-toolbar.tsx            # ✨ НОВЫЙ - Unified toolbar
├── data-table-faceted-filter.tsx     # ✨ НОВЫЙ - Faceted filters
├── README.md                         # ✨ НОВЫЙ - Документация
├── EXAMPLES.md                       # ✨ НОВЫЙ - Примеры
├── CHANGELOG.md                      # ✨ НОВЫЙ - История изменений
├── data-table.tsx                    # 🔄 ОБНОВЛЕН
├── data-table.model.ts               # 🔄 ОБНОВЛЕН
├── data-table-column-header.tsx      # 🔄 ОБНОВЛЕН
├── data-table-pagination.tsx         # ✅ БЕЗ ИЗМЕНЕНИЙ
├── data-table-view-options.tsx       # ✅ БЕЗ ИЗМЕНЕНИЙ
└── data-table-search.tsx             # ✅ БЕЗ ИЗМЕНЕНИЙ
```

### 🔄 Обратная совместимость

Все существующие использования DataTable продолжат работать без изменений:

```tsx
// Старый код работает как прежде
<DataTable
  columns={columns}
  data={data}
  pagination={{ ... }}
  sort={{ ... }}
/>
```

Новые функции доступны через opt-in:

```tsx
// Новый код с дополнительными возможностями
<DataTable
  columns={columns}
  data={data}
  enableSorting
  enableFiltering
  toolbar={(table) => <DataTableToolbar ... />}
/>
```

### 📊 Режимы работы

#### Server-Side Mode (существующий)
```tsx
<DataTable
  pagination={{ page, limit, total, onChangePage, onChangeLimit }}
  sort={{ value, onChange }}
/>
```

**Когда использовать:**
- Большие datasets (>100 записей)
- Данные из API с пагинацией
- Медленные запросы

#### Client-Side Mode (новый)
```tsx
<DataTable
  enableSorting
  enableFiltering
/>
```

**Когда использовать:**
- Маленькие datasets (<100 записей)
- Статические данные
- Быстрая фильтрация без запросов

### 🚀 Миграция

#### Добавление Toolbar
Старый код:
```tsx
<Input
  placeholder="Search..."
  onChange={(e) => setSearch(e.target.value)}
/>
<DataTable columns={columns} data={data} />
```

Новый код:
```tsx
<DataTable
  columns={columns}
  data={data}
  enableFiltering
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      searchKey="name"
      searchPlaceholder="Search..."
    />
  )}
/>
```

#### Добавление Faceted Filters
```tsx
<DataTable
  enableFiltering
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      filters={[
        {
          column: "status",
          title: "Status",
          options: [...],
        },
      ]}
    />
  )}
/>
```

### 🎯 Best Practices

1. **Используйте index.ts для импортов**
   ```tsx
   // ✅ Правильно
   import { DataTable, DataTableToolbar } from "@/components/data-table";
   
   // ❌ Неправильно
   import { DataTable } from "@/components/data-table/data-table";
   ```

2. **Мемоизируйте columns**
   ```tsx
   const columns = useMemo<ColumnDef<T>[]>(() => [...], []);
   ```

3. **Выбирайте правильный режим**
   - Client-side для < 100 записей
   - Server-side для > 100 записей

4. **Используйте DataTableToolbar**
   Вместо кастомного UI используйте готовый toolbar

### 🐛 Исправления

- Улучшена типизация для избежания type errors
- Исправлены проблемы с client-side сортировкой
- Улучшена производительность skeleton
- Исправлены проблемы с column visibility

### 📚 Документация

Полная документация доступна в:
- **README.md** - основное руководство
- **EXAMPLES.md** - практические примеры
- Комментарии в коде

### 🙏 Основано на

Этот компонент основан на:
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table)
- [TanStack Table v8](https://tanstack.com/table/v8)
- Лучшие практики React и TypeScript

### 💡 Следующие шаги

Рекомендуется:
1. Изучить README.md для понимания всех возможностей
2. Просмотреть EXAMPLES.md для практических примеров
3. Постепенно мигрировать существующие таблицы на новый API
4. Использовать DataTableToolbar для консистентности UI

---

**Дата релиза:** Ноябрь 7, 2024  
**Версия:** 2.0.0  
**Статус:** ✅ Готов к использованию
