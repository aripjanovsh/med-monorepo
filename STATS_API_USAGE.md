# Stats API Usage Guide

## Обзор

Универсальный API для получения статистики с гибкой фильтрацией по типам метрик.

## Backend Endpoint

```
GET /api/v1/stats
```

### Query Parameters

- `types` (опционально): Массив типов статистики для получения. Если не указан, возвращаются все типы.
- `startDate` (опционально): Начальная дата периода (ISO 8601). По умолчанию - сегодня.
- `endDate` (опционально): Конечная дата периода (ISO 8601). По умолчанию - сегодня.

### Доступные типы статистики (StatsType)

- `PATIENTS_COUNT` - Общее количество пациентов
- `VISITS_COUNT` - Количество визитов
- `APPOINTMENTS_COUNT` - Количество записей
- `REVENUE_TOTAL` - Общая выручка
- `UNPAID_INVOICES_COUNT` - Количество неоплаченных счетов
- `PATIENTS_IN_QUEUE` - Пациенты в очереди
- `COMPLETED_VISITS` - Завершенные визиты
- `CANCELED_APPOINTMENTS` - Отмененные записи
- `NO_SHOW_APPOINTMENTS` - No-show записи

### Response Format

```typescript
{
  startDate: string;  // ISO 8601
  endDate: string;    // ISO 8601
  stats: {
    PATIENTS_COUNT?: number;
    VISITS_COUNT?: number;
    APPOINTMENTS_COUNT?: number;
    REVENUE_TOTAL?: number;
    UNPAID_INVOICES_COUNT?: number;
    PATIENTS_IN_QUEUE?: number;
    COMPLETED_VISITS?: number;
    CANCELED_APPOINTMENTS?: number;
    NO_SHOW_APPOINTMENTS?: number;
  }
}
```

## Примеры использования

### 1. Получить все статистики за сегодня

```typescript
const { data } = useGetStatsQuery();

// Доступ к данным:
const patientsCount = data?.stats.PATIENTS_COUNT;
const revenue = data?.stats.REVENUE_TOTAL;
```

**URL:** `/api/v1/stats`

### 2. Получить только количество пациентов и визитов

```typescript
const { data } = useGetStatsQuery({
  types: [StatsType.PATIENTS_COUNT, StatsType.VISITS_COUNT],
});

// Ответ будет содержать только запрошенные типы:
// {
//   startDate: "2024-11-16T00:00:00.000Z",
//   endDate: "2024-11-16T23:59:59.999Z",
//   stats: {
//     PATIENTS_COUNT: 42,
//     VISITS_COUNT: 38
//   }
// }
```

**URL:** `/api/v1/stats?types=PATIENTS_COUNT,VISITS_COUNT`

### 3. Получить статистику за определенный период

```typescript
const { data } = useGetStatsQuery({
  startDate: "2024-11-01",
  endDate: "2024-11-15",
});
```

**URL:** `/api/v1/stats?startDate=2024-11-01&endDate=2024-11-15`

### 4. Получить только выручку за месяц

```typescript
const { data } = useGetStatsQuery({
  types: [StatsType.REVENUE_TOTAL],
  startDate: "2024-11-01",
  endDate: "2024-11-30",
});

const monthlyRevenue = data?.stats.REVENUE_TOTAL ?? 0;
```

**URL:** `/api/v1/stats?types=REVENUE_TOTAL&startDate=2024-11-01&endDate=2024-11-30`

### 5. Получить статистику очереди в реальном времени

```typescript
const { data } = useGetStatsQuery(
  {
    types: [StatsType.PATIENTS_IN_QUEUE, StatsType.COMPLETED_VISITS],
  },
  {
    pollingInterval: 30000, // обновлять каждые 30 секунд
  }
);

const inQueue = data?.stats.PATIENTS_IN_QUEUE ?? 0;
const completed = data?.stats.COMPLETED_VISITS ?? 0;
```

## Преимущества подхода

1. **Производительность**: Запрашиваются только нужные метрики
2. **Гибкость**: Можно комбинировать любые типы статистики
3. **Оптимизация**: Backend выполняет запросы параллельно
4. **Простота**: Один эндпоинт для всех типов статистики

## Migration from Old API

### Было (старый getDashboardStats):

```typescript
const { data: stats } = useGetDashboardStatsQuery({ date: "2024-11-16" });
// Всегда возвращал все метрики
```

### Стало (новый getStats):

```typescript
// Получить все метрики
const { data } = useGetStatsQuery({
  startDate: "2024-11-16",
  endDate: "2024-11-16",
});
const stats = data?.stats;

// Или только нужные метрики
const { data } = useGetStatsQuery({
  types: [StatsType.PATIENTS_COUNT, StatsType.REVENUE_TOTAL],
  startDate: "2024-11-16",
  endDate: "2024-11-16",
});
```
