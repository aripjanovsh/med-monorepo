# Интеграция протоколов визитов

## Обзор

Добавлена функциональность для работы с шаблонами протоколов на странице визита. Врач теперь может:
1. Выбрать шаблон протокола из списка доступных
2. Просмотреть превью шаблона
3. Заполнить форму протокола
4. Сохранить заполненные данные

## Изменения Frontend

### Новые компоненты

1. **Combobox** (`/components/ui/combobox.tsx`)
   - Универсальный компонент выбора с поиском
   - Используется для выбора шаблона протокола

2. **VisitProtocol** (`/features/visit/components/visit-protocol.tsx`)
   - Основной компонент для работы с протоколом визита
   - Включает:
     - Выбор шаблона протокола (Combobox)
     - Предпросмотр шаблона (TemplatePreview)
     - Заполнение формы (FormRenderer)
     - Сохранение данных

### Обновленные файлы

1. **visit.dto.ts**
   - Добавлено поле `protocolData?: string` в `VisitResponseDto`
   - Добавлено поле `protocolData?: string` в `UpdateVisitRequestDto`

2. **visit/index.ts**
   - Экспортирован компонент `VisitProtocol`

3. **page.tsx** (страница визита)
   - Интегрирован компонент `VisitProtocol`
   - Добавлен импорт `FilledFormData` типа
   - Протокол размещен между примечаниями и назначениями

## Изменения Backend

### Обновленные файлы

1. **schema.prisma**
   - Добавлено поле `protocolData String?` в модель `Visit`
   - Комментарий: "JSON string of filled protocol data"

2. **create-visit.dto.ts**
   - Добавлено поле `protocolData?: string`
   - Валидация: `@IsOptional()` + `@IsString()`

3. **visit-response.dto.ts**
   - Добавлено поле `protocolData?: string` в `VisitResponseDto`
   - С декоратором `@Expose()` и `@ApiPropertyOptional()`

4. **Миграция базы данных**
   - Создана миграция `20251020195007_add_protocol_data_to_visit`
   - SQL: `ALTER TABLE "visits" ADD COLUMN "protocolData" TEXT;`

## Как использовать

1. Перейти на страницу визита: `/cabinet/patients/[id]/visits/[visitId]`
2. Найти секцию "Шаблон протокола"
3. Выбрать шаблон из списка
4. (Опционально) Нажать "Показать превью" для просмотра структуры формы
5. Заполнить поля формы
6. Нажать "Сохранить протокол"

## Технические детали

- **Формат данных**: FilledFormData сохраняется как JSON string
- **Валидация**: Поля с `required: true` должны быть заполнены
- **Редактирование**: Доступно только для визитов со статусом `IN_PROGRESS`
- **Компоненты формы**: text, textarea, number, date, select, radio, checkbox, tags

## Миграция БД

Для применения миграции:

```bash
cd packages/backend
npx prisma migrate dev
```

## Следующие шаги

1. Протестировать функциональность на тестовых данных
2. Убедиться, что миграция применена в production
3. Добавить валидацию JSON на backend (опционально)
4. Рассмотреть возможность добавления версионирования протоколов
