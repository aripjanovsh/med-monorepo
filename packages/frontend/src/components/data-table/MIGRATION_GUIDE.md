# DataTable v2.0 - Руководство по миграции

## 🎯 Краткая сводка

DataTable теперь поддерживает:
- ✅ Client-side сортировку и фильтрацию
- ✅ Unified Toolbar с поиском и фильтрами
- ✅ Faceted Filters (фильтры по категориям)
- ✅ Улучшенный UX и типизация
- ✅ **Полная обратная совместимость**

## 🔄 Обратная совместимость

**Хорошие новости:** Все существующие таблицы продолжат работать без изменений!

```tsx
// Этот код работает как и раньше
<DataTable
  columns={columns}
  data={data}
  pagination={{ ... }}
  sort={{ ... }}
/>
```

## 🚀 Быстрый старт с новыми функциями

### 1. Client-Side таблица (для < 100 записей)

```tsx
import { DataTable, DataTableToolbar } from "@/components/data-table";

<DataTable
  columns={columns}
  data={data}
  enableSorting        // 👈 Включает client-side сортировку
  enableFiltering      // 👈 Включает client-side фильтрацию
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      searchKey="name"
      searchPlaceholder="Поиск по имени..."
    />
  )}
/>
```

### 2. Добавление фильтров по статусу

```tsx
<DataTable
  columns={columns}
  data={data}
  enableSorting
  enableFiltering
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      searchKey="patientName"
      filters={[
        {
          column: "status",           // Имя колонки
          title: "Статус",            // Заголовок фильтра
          options: [
            { label: "Оплачен", value: "PAID" },
            { label: "Не оплачен", value: "UNPAID" },
          ],
        },
      ]}
    />
  )}
/>
```

### 3. Row Click Handler

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

<DataTable
  columns={columns}
  data={data}
  onRowClick={(row) => {
    router.push(`/patients/${row.original.id}`);
  }}
/>
```

## 📋 Примеры миграции реальных случаев

### Пример 1: Таблица пациентов

**До (server-side с внешним поиском):**
```tsx
export function PatientsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetPatientsQuery({ search, ... });

  return (
    <>
      <Input
        placeholder="Поиск..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <DataTable columns={columns} data={data?.items || []} />
    </>
  );
}
```

**После (с DataTableToolbar):**
```tsx
export function PatientsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetPatientsQuery({ search, ... });

  return (
    <DataTable
      columns={columns}
      data={data?.items || []}
      isLoading={isLoading}
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchKey="lastName"
          searchPlaceholder="Поиск по фамилии..."
        />
      )}
    />
  );
}
```

### Пример 2: Добавление фильтров к Invoice

**До:**
```tsx
<DataTable
  columns={columns}
  data={invoices}
  pagination={{ ... }}
/>
```

**После:**
```tsx
<DataTable
  columns={columns}
  data={invoices}
  pagination={{ ... }}
  enableFiltering
  toolbar={(table) => (
    <DataTableToolbar
      table={table}
      searchKey="invoiceNumber"
      filters={[
        {
          column: "status",
          title: "Статус",
          options: [
            { label: "Оплачен", value: "PAID" },
            { label: "Не оплачен", value: "UNPAID" },
            { label: "Возврат", value: "REFUNDED" },
          ],
        },
        {
          column: "paymentMethod",
          title: "Метод оплаты",
          options: [
            { label: "Наличные", value: "CASH" },
            { label: "Карта", value: "CARD" },
            { label: "Перевод", value: "TRANSFER" },
          ],
        },
      ]}
    />
  )}
/>
```

## 🎨 Улучшение существующих колонок

### Добавление сортировки к колонкам

**До:**
```tsx
const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "lastName",
    header: "Фамилия",
  },
];
```

**После (с client-side сортировкой):**
```tsx
const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "lastName",
    header: "Фамилия",
    // Сортировка автоматически работает если enableSorting={true}
  },
];

<DataTable
  columns={columns}
  data={data}
  enableSorting  // 👈 Включите это
/>
```

## 📚 Полная документация

- **README.md** - Полное руководство со всеми возможностями
- **EXAMPLES.md** - 8 практических примеров использования
- **CHANGELOG.md** - Детальное описание всех изменений

## 💡 Рекомендации

### Когда использовать Client-Side режим

✅ **Используйте client-side когда:**
- Данных меньше 100 записей
- Нужна быстрая фильтрация без запросов
- Данные статические или редко меняются

```tsx
<DataTable enableSorting enableFiltering />
```

### Когда использовать Server-Side режим

✅ **Используйте server-side когда:**
- Данных больше 100 записей
- Нужна пагинация с сервера
- Данные часто обновляются

```tsx
<DataTable
  pagination={{ page, limit, total, onChangePage, onChangeLimit }}
  sort={{ value, onChange }}
/>
```

## 🆕 Новые импорты

Используйте централизованный index.ts:

```tsx
// ✅ Правильно
import {
  DataTable,
  DataTableToolbar,
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";

// ❌ Неправильно
import { DataTable } from "@/components/data-table/data-table";
```

## ❓ FAQ

### Q: Нужно ли мигрировать существующие таблицы?
**A:** Нет, все работает как раньше. Мигрируйте только если хотите использовать новые функции.

### Q: Как работает фильтрация?
**A:** Для client-side - автоматически. Для server-side - нужно обрабатывать в API.

### Q: Можно ли смешивать режимы?
**A:** Да! Например, client-side сортировка + server-side pagination.

```tsx
<DataTable
  enableSorting          // client-side
  pagination={{ ... }}   // server-side
/>
```

### Q: Работают ли фильтры с server-side?
**A:** DataTableToolbar работает для client-side фильтрации. Для server-side используйте существующий подход.

## 🐛 Известные проблемы

- TypeScript может показывать ошибки импорта в IDE, но они исчезнут после перезапуска
- Faceted filters работают только с client-side фильтрацией

## 📞 Поддержка

Если возникли вопросы:
1. Проверьте EXAMPLES.md для практических примеров
2. Изучите README.md для полной документации
3. Посмотрите существующие таблицы в проекте (employees, patients, invoices)

---

**Версия:** 2.0.0  
**Дата:** Ноябрь 7, 2024  
**Статус:** ✅ Готов к использованию
