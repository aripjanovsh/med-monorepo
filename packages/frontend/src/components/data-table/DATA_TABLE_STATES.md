# DataTable Empty & Error States

Универсальные компоненты для отображения пустых состояний и ошибок в DataTable.

## DataTableEmptyState

Компонент для отображения пустого состояния (нет данных).

### Props

| Prop          | Type                  | Default                               | Description                      |
| ------------- | --------------------- | ------------------------------------- | -------------------------------- |
| `title`       | `string`              | `"Нет данных"`                        | Заголовок                        |
| `description` | `string`              | `"Данные отсутствуют или не найдены"` | Описание                         |
| `icon`        | `React.ComponentType` | `FileQuestion`                        | Иконка                           |
| `action`      | `React.ReactNode`     | -                                     | Дополнительное действие (кнопка) |

### Примеры использования

#### Базовый пример

```tsx
import { DataTableEmptyState } from "@/components/data-table";

<DataTable
  emptyState={
    <DataTableEmptyState
      title="Сотрудники не найдены"
      description="Попробуйте изменить параметры поиска"
    />
  }
/>;
```

#### С кастомной иконкой

```tsx
import { Users } from "lucide-react";

<DataTableEmptyState
  title="Нет пользователей"
  description="Добавьте первого пользователя"
  icon={Users}
/>;
```

#### С действием (кнопкой)

```tsx
import { Button } from "@/components/ui/button";

<DataTableEmptyState
  title="Нет записей"
  description="Начните с создания новой записи"
  action={<Button onClick={handleCreate}>Создать запись</Button>}
/>;
```

## DataTableErrorState

Компонент для отображения ошибки загрузки.

### Props

| Prop          | Type                  | Default                        | Description                           |
| ------------- | --------------------- | ------------------------------ | ------------------------------------- |
| `title`       | `string`              | `"Ошибка при загрузке данных"` | Заголовок                             |
| `description` | `string`              | -                              | Описание (или извлекается из `error`) |
| `error`       | `Error \| unknown`    | -                              | Объект ошибки                         |
| `icon`        | `React.ComponentType` | `AlertCircle`                  | Иконка                                |
| `onRetry`     | `() => void`          | -                              | Callback для повторной попытки        |
| `retryText`   | `string`              | `"Повторить попытку"`          | Текст кнопки retry                    |

### Примеры использования

#### Базовый пример с retry

```tsx
import { DataTableErrorState } from "@/components/data-table";

<DataTable
  emptyState={
    error ? (
      <DataTableErrorState
        title="Ошибка загрузки"
        error={error}
        onRetry={refetch}
      />
    ) : (
      <DataTableEmptyState />
    )
  }
/>;
```

#### С кастомным сообщением

```tsx
<DataTableErrorState
  title="Не удалось загрузить сотрудников"
  description="Проверьте подключение к интернету и попробуйте снова"
  onRetry={refetchEmployees}
  retryText="Обновить"
/>
```

#### Без retry кнопки

```tsx
<DataTableErrorState
  title="Доступ запрещен"
  description="У вас нет прав для просмотра этих данных"
/>
```

## Полный пример использования

```tsx
import {
  DataTable,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";

function EmployeesTable() {
  const { data, isLoading, error, refetch } = useGetEmployeesQuery(params);

  return (
    <DataTable
      columns={columns}
      data={data?.items || []}
      isLoading={isLoading}
      emptyState={
        error ? (
          <DataTableErrorState
            title="Ошибка при загрузке сотрудников"
            error={error}
            onRetry={refetch}
          />
        ) : (
          <DataTableEmptyState
            title="Сотрудники не найдены"
            description="Попробуйте изменить параметры поиска или фильтры"
          />
        )
      }
    />
  );
}
```

## Кастомизация

### Свои компоненты

Вы можете создать свои варианты для специфичных случаев:

```tsx
function NoPatients() {
  return (
    <DataTableEmptyState
      title="Нет пациентов"
      description="Добавьте первого пациента для начала работы"
      icon={UserPlus}
      action={
        <Button asChild>
          <Link href="/cabinet/patients/new">Добавить пациента</Link>
        </Button>
      }
    />
  );
}

<DataTable emptyState={<NoPatients />} />;
```

### Условное отображение

```tsx
<DataTable
  emptyState={
    error ? (
      <DataTableErrorState error={error} onRetry={refetch} />
    ) : searchTerm ? (
      <DataTableEmptyState
        title={`Нет результатов для "${searchTerm}"`}
        description="Попробуйте изменить поисковый запрос"
      />
    ) : (
      <DataTableEmptyState
        title="Список пуст"
        description="Здесь пока нет данных"
      />
    )
  }
/>
```

## Стилизация

Оба компонента используют Tailwind CSS и адаптируются к теме приложения:

- Empty state: серые тона
- Error state: красные тона (destructive)

### Кастомная стилизация через wrapper

```tsx
<div className="min-h-[400px]">
  <DataTable emptyState={<DataTableEmptyState />} />
</div>
```

## Best Practices

1. **Всегда показывайте error state при ошибках:**

   ```tsx
   emptyState={error ? <DataTableErrorState /> : <DataTableEmptyState />}
   ```

2. **Добавляйте onRetry для всех error states:**

   ```tsx
   <DataTableErrorState onRetry={refetch} />
   ```

3. **Используйте понятные сообщения:**

   ```tsx
   <DataTableEmptyState
     title="Счета не найдены"
     description="Попробуйте изменить период или фильтры"
   />
   ```

4. **Добавляйте действия в empty state:**
   ```tsx
   <DataTableEmptyState action={<Button>Создать</Button>} />
   ```

## Доступные иконки (lucide-react)

### Для Empty State:

- `FileQuestion` (default)
- `Inbox`
- `Search`
- `Users`
- `FileText`
- `Package`

### Для Error State:

- `AlertCircle` (default)
- `XCircle`
- `AlertTriangle`
- `WifiOff`

```tsx
import { Inbox, AlertTriangle } from "lucide-react";

<DataTableEmptyState icon={Inbox} />
<DataTableErrorState icon={AlertTriangle} />
```

---

**Версия:** 1.0.0  
**Создано:** Ноябрь 2024
