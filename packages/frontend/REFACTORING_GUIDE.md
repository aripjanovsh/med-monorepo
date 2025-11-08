# Руководство по рефакторингу Frontend

Архитектурные принципы и стандарты для чистого кода.

---

## 1. Страницы со списками (List Pages)

### Ключевые принципы:

- ✅ Используй `useDataTableState` для управления состоянием (search, pagination, sorting)
- ✅ Оберни handlers в `useCallback`
- ✅ Мемоизируй финальные query params через `useMemo`
- ✅ Actions column добавляй через spread на странице
- ✅ Используй `DataTableToolbar`, `DataTableEmptyState`, `DataTableErrorState`
- ✅ Добавь `onRowClick` для навигации
- ❌ НЕ создавай ручную обработку loading/error
- ❌ НЕ создавай отдельные state для search, pagination, sorting

### Структура:

```tsx
export default function ExamplePage() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [activeTab, setActiveTab] = useState("all");

  const { queryParams, handlers, setters, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "createdAt", desc: true }],
  });

  const finalQueryParams = useMemo(() => ({
    ...queryParams,
    ...(activeTab !== "all" && { status: activeTab }),
  }), [queryParams, activeTab]);

  const { data, isLoading, error, refetch } = useGetItemsQuery(finalQueryParams);

  const handleDelete = useCallback((item) => {
    confirm({ /* ... */ });
  }, [confirm]);

  return (
    <DataTable
      columns={[...itemColumns, actionsColumn]}
      data={data?.data}
      pagination={{ ...handlers.pagination, total: data?.meta?.total }}
      toolbar={(table) => <DataTableToolbar table={table} /* ... */ />}
      onRowClick={(row) => router.push(url(ROUTES.ITEM_DETAIL, { id: row.id }))}
    />
  );
}
```

---

## 2. Data Table Columns

**Правило**: Columns - **чистый массив** без actions. Actions добавляются на странице через spread.

### ✅ ПРАВИЛЬНО:

```tsx
// features/invoice/components/invoice-columns.tsx
export const invoiceColumns: ColumnDef<InvoiceDto>[] = [
  { accessorKey: "invoiceNumber", header: "Номер" },
  { 
    accessorKey: "patient", 
    header: "Пациент",
    cell: ({ row }) => getPatientFullName(row.original.patient)
  },
  // ... другие колонки
];
```

### ❌ НЕПРАВИЛЬНО:

```tsx
// НЕ создавай функцию с actions!
export const createInvoiceColumns = (actions) => [ /* ... */ ];
```

### Использование:

```tsx
<DataTable
  columns={[
    ...invoiceColumns,
    { id: "actions", cell: ({ row }) => <ActionsMenu item={row.original} /> }
  ]}
/>
```

---

## 3. Модальные окна через Dialog Manager

**Правило**: Используй `useDialog` и `useConfirmDialog` вместо локального `useState`.

### ✅ ПРАВИЛЬНО:

```tsx
const createDialog = useDialog(CreateSheet);
const confirm = useConfirmDialog();

const handleCreate = useCallback(() => {
  createDialog.open({ onSuccess: () => { /* ... */ } });
}, [createDialog]);

const handleDelete = useCallback((item) => {
  confirm({
    title: "Удалить?",
    variant: "destructive",
    onConfirm: async () => { await deleteItem(item.id); }
  });
}, [confirm]);
```

### ❌ НЕПРАВИЛЬНО:

```tsx
const [showSheet, setShowSheet] = useState(false); // НЕ делай так!
<CreateSheet open={showSheet} onOpenChange={setShowSheet} />
```

**Преимущества**: Меньше кода, типобезопасность, автоматический рендеринг.

---

## 4. Feature Model Pattern (DRY принцип)

**Правило**: Каждый feature владеет утилитами для своих данных. НЕ дублируй функции.

### ✅ ПРАВИЛЬНО:

```tsx
// features/patient/patient.model.ts
export const getPatientFullName = (patient: PatientDto) => 
  [patient.lastName, patient.firstName, patient.middleName].filter(Boolean).join(" ");

// Использование в других features
import { getPatientFullName } from "@/features/patient";
<div>{getPatientFullName(visit.patient)}</div>
```

### ❌ НЕПРАВИЛЬНО:

```tsx
// features/invoice/invoice.model.ts
export const getInvoicePatientFullName = (patient) => /* ... */; // Дублирование!
```

### Принципы владения:

| Данные | Владелец | Файл |
|--------|----------|------|
| Employee columns/utils | `employees` | `employees/employee.model.ts` |
| Patient utils | `patients` | `patients/patient.model.ts` |
| Currency/Date/Phone | global `/lib` | `/lib/currency.utils.ts` |
| Visit status | `visits` | `visits/visit.constants.ts` |

**Экспортируй** model функции из `index.ts` feature.

---

## 5. Detail страницы - Loading и Error состояния

**Правило**: Используй `LoadingState` и `ErrorState` вместо ручной разметки.

```tsx
import { LoadingState, ErrorState } from "@/components/states";

export default function DetailPage({ params }) {
  const { id } = use(params);
  const { data, isLoading, error, refetch } = useGetQuery(id);

  if (isLoading) return <LoadingState title="Загрузка..." />;
  
  if (error || !data) {
    return (
      <ErrorState
        title="Не найдено"
        onRetry={refetch}
        onBack={() => router.push(ROUTES.LIST)}
      />
    );
  }

  return <Overview data={data} />;
}
```

- ✅ Используй для detail страниц: `/patients/[id]`, `/invoices/[id]`
- ❌ НЕ используй для list страниц (там `DataTableEmptyState`)

---

## 6. Detail компоненты - Overview/Profile

**Ключевые правила**:

1. **Используй `useDialog`/`useConfirmDialog`** вместо `useState`
2. **Используй `ProfileField`** для label-value полей
3. **Используй `DataTable`** вместо ручной `<Table>` разметки
4. **Columns в отдельных файлах**, НЕ inline в компоненте
5. **Мемоизируй handlers** через `useCallback`

### Пример:

```tsx
// features/invoice/components/invoice-items-columns.tsx
export const invoiceItemsColumns: ColumnDef<ItemDto>[] = [
  { accessorKey: "name", header: "Название" },
  { accessorKey: "amount", header: "Сумма", cell: ({ row }) => formatCurrency(row.original.amount) },
];

// features/invoice/components/invoice-overview.tsx
import { invoiceItemsColumns } from "./invoice-items-columns";

export function InvoiceOverview({ invoice }: Props) {
  const confirm = useConfirmDialog();
  
  const handleDelete = useCallback(() => {
    confirm({ title: "Удалить?", onConfirm: async () => { /* ... */ } });
  }, [confirm]);

  return (
    <>
      <ProfileField label="Пациент" value={getPatientFullName(patient)} />
      <DataTable columns={invoiceItemsColumns} data={invoice.items} />
    </>
  );
}
```

---

## 7. Routing - универсальная функция url()

**Правило**: Используй `url(ROUTES.X, { id })` вместо отдельных helper функций.

```tsx
import { ROUTES, url } from "@/constants/route.constants";

// ✅ ПРАВИЛЬНО
router.push(url(ROUTES.PATIENT_DETAIL, { id: patientId }));
<Link href={url(ROUTES.INVOICE_DETAIL, { id: invoice.id })}>Просмотр</Link>

// ❌ НЕПРАВИЛЬНО
const getPatientDetailRoute = (id: string) => `/cabinet/patients/${id}`;
```

---

## 8. Чек-лист для рефакторинга

### List страницы:
- [ ] `useDataTableState` для состояния
- [ ] Handlers в `useCallback`
- [ ] Query params в `useMemo`
- [ ] Actions column через spread
- [ ] `DataTableToolbar`, `DataTableEmptyState`, `DataTableErrorState`
- [ ] `onRowClick` для навигации

### Columns:
- [ ] Чистый массив без actions
- [ ] Используются функции из `feature.model.ts`
- [ ] Нет дублирования логики

### Модальные окна:
- [ ] `useDialog` / `useConfirmDialog`
- [ ] Нет локального `useState`

### Feature Model (DRY):
- [ ] Создан `feature.model.ts`
- [ ] Функции экспортированы из `index.ts`
- [ ] Нет дублирования между features
- [ ] Глобальные утилиты в `/lib/`

### Detail страницы/компоненты:
- [ ] `LoadingState` / `ErrorState`
- [ ] `ProfileField` для label-value
- [ ] `DataTable` для таблиц
- [ ] **Columns в отдельных файлах**
- [ ] Handlers в `useCallback`

### Routing:
- [ ] `url(ROUTES.X, { id })`
- [ ] Нет дублирующих helper функций

---

## 9. Заключение

Следование этим принципам гарантирует:

- ✅ **Читабельный код** - единообразная структура
- ✅ **DRY принцип** - нет дублирования логики
- ✅ **Feature ownership** - четкое разделение ответственности
- ✅ **Переиспользуемость** - утилиты в model.ts
- ✅ **Простота поддержки** - легко найти и изменить код

**Помни**: Код должен быть красивым, простым и понятным! 🎨
