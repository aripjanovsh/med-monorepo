# ✅ Медкарта Frontend - Детальные Чеклисты

## 📦 Подготовка

### API Tags
- [ ] Добавить в `src/constants/api-tags.constants.ts`:
  ```typescript
  export const API_TAG_VISITS = "Visits" as const;
  export const API_TAG_PRESCRIPTIONS = "Prescriptions" as const;
  export const API_TAG_LAB_ORDERS = "LabOrders" as const;
  ```
- [ ] Добавить новые tags в `src/store/api/root.api.ts` tagTypes массив

### Permissions
- [ ] Проверить наличие permissions в базе данных (должны быть созданы на бэкенде)
- [ ] Добавить константы permissions в фронтенд если нужно

---

## 1️⃣ Feature: Visit

### Структура файлов
- [ ] Создать директорию `src/features/visit/`
- [ ] Создать директорию `src/features/visit/components/`
- [ ] Создать директорию `src/features/visit/components/detail/`

### visit.dto.ts
- [ ] Создать `src/features/visit/visit.dto.ts`
- [ ] Добавить type `VisitStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELED"`
- [ ] Добавить интерфейсы:
  - `VisitResponseDto` (полное совпадение с бэкенд DTO)
  - `CreateVisitRequestDto`
  - `UpdateVisitRequestDto`
  - `UpdateVisitStatusRequestDto`
  - `VisitsQueryParamsDto extends QueryParamsDto`
  - `VisitsListResponseDto = PaginatedResponseDto<VisitResponseDto>`
- [ ] Добавить вложенные DTO (SimplePatientDto, SimpleEmployeeDto, и т.д.)

### visit.constants.ts
- [ ] Создать `src/features/visit/visit.constants.ts`
- [ ] Добавить объект `VISIT_STATUS` с const assertion
- [ ] Добавить тип `VisitStatus`
- [ ] Добавить массив `VISIT_STATUS_OPTIONS` для select'ов
- [ ] Добавить объект `VISIT_STATUS_LABELS: Record<VisitStatus, string>`
- [ ] Добавить объект `VISIT_STATUS_COLORS` для Badge компонентов

### visit.schema.ts
- [ ] Создать `src/features/visit/visit.schema.ts`
- [ ] Создать `visitFormSchema` с yup
- [ ] Создать `createVisitRequestSchema`
- [ ] Создать `updateVisitRequestSchema`
- [ ] Экспортировать тип `VisitFormData = yup.InferType<typeof visitFormSchema>`

### visit.model.ts
- [ ] Создать `src/features/visit/visit.model.ts`
- [ ] Добавить `getVisitStatusLabel(status: string): string`
- [ ] Добавить `getPatientFullName(visit: VisitResponseDto): string`
- [ ] Добавить `getEmployeeFullName(visit: VisitResponseDto): string`
- [ ] Добавить `isVisitEditable(visit: VisitResponseDto): boolean`
- [ ] Добавить `canCompleteVisit(visit: VisitResponseDto): boolean`

### visit.api.ts
- [ ] Создать `src/features/visit/visit.api.ts`
- [ ] Импортировать `rootApi` из `@/store/api/root.api`
- [ ] Создать `visitApi = rootApi.injectEndpoints()`
- [ ] Добавить endpoint `getVisits: builder.query<VisitsListResponseDto, VisitsQueryParamsDto>`
  - providesTags: `[API_TAG_VISITS]`
- [ ] Добавить endpoint `getVisit: builder.query<VisitResponseDto, string>`
  - providesTags: `[{ type: API_TAG_VISITS, id }]`
- [ ] Добавить endpoint `createVisit: builder.mutation<VisitResponseDto, CreateVisitRequestDto>`
  - invalidatesTags: `[API_TAG_VISITS]`
- [ ] Добавить endpoint `updateVisit: builder.mutation<VisitResponseDto, UpdateVisitRequestDto>`
  - invalidatesTags: `[{ type: API_TAG_VISITS, id }, API_TAG_VISITS]`
- [ ] Добавить endpoint `updateVisitStatus: builder.mutation`
  - invalidatesTags: `[{ type: API_TAG_VISITS, id }, API_TAG_VISITS]`
- [ ] Добавить endpoint `deleteVisit: builder.mutation<void, string>`
  - invalidatesTags: `[{ type: API_TAG_VISITS, id }, API_TAG_VISITS]`
- [ ] Экспортировать все hooks (useGetVisitsQuery, useCreateVisitMutation, и т.д.)

### Компоненты

#### visit-status-badge.tsx
- [ ] Создать `src/features/visit/components/visit-status-badge.tsx`
- [ ] Использовать Badge из shadcn/ui
- [ ] Props: `{ status: VisitStatus }`
- [ ] Применять цвета из `VISIT_STATUS_COLORS`
- [ ] Отображать label из `VISIT_STATUS_LABELS`

#### visit-columns.tsx
- [ ] Создать `src/features/visit/components/visit-columns.tsx`
- [ ] Экспортировать функцию `createVisitColumns(onEdit?, onView?, onDelete?)`
- [ ] Колонки:
  - Checkbox для выбора (id: "select")
  - visitDate (форматировать через date-fns)
  - patient (кликабельная ссылка, вызывает onView)
  - employee (отображение ФИО врача)
  - status (использовать VisitStatusBadge)
  - actions (DropdownMenu с Edit/View/Delete)
- [ ] Edit доступен только если status === "IN_PROGRESS"

#### visit-form.tsx
- [ ] Создать `src/features/visit/components/visit-form.tsx`
- [ ] Props: `{ mode: "create" | "edit", initialData?: VisitFormData, onSuccess?: () => void }`
- [ ] Использовать `useForm` с `yupResolver(visitFormSchema)`
- [ ] Поля формы:
  - Patient selector (автокомплит) - useGetPatientsQuery
  - Employee selector (автокомплит) - useGetEmployeesQuery
  - Appointment selector (опционально) - useGetAppointmentsQuery
  - Protocol template selector (опционально) - useGetProtocolTemplatesQuery
  - Visit date (DateTimePicker)
  - Notes (Textarea)
- [ ] Submit handler с `createVisit` или `updateVisit` mutation
- [ ] Обработка ошибок с toast notifications
- [ ] Loading states

#### page-visit-form.tsx
- [ ] Создать `src/features/visit/components/page-visit-form.tsx`
- [ ] Props: `{ mode: "create" | "edit", visitId?: string }`
- [ ] Для edit mode: загрузить данные через `useGetVisitQuery(visitId)`
- [ ] Обертка с LayoutHeader (breadcrumbs, back button)
- [ ] Рендерить VisitForm с правильным mode и данными

#### detail/visit-overview.tsx
- [ ] Создать `src/features/visit/components/detail/visit-overview.tsx`
- [ ] Props: `{ visit: VisitResponseDto }`
- [ ] Отображение:
  - Информация о пациенте (ФИО, дата рождения, пол)
  - Информация о враче (ФИО, должность)
  - Дата и время визита
  - Статус с badge
  - Appointment info (если есть)
  - Protocol template (если выбран)
  - Notes
- [ ] Кнопки действий:
  - "Редактировать" (если status === "IN_PROGRESS")
  - "Завершить прием" (если status === "IN_PROGRESS")
  - "Отменить" (если status === "IN_PROGRESS")

#### detail/visit-prescriptions.tsx
- [ ] Создать `src/features/visit/components/detail/visit-prescriptions.tsx`
- [ ] Props: `{ visitId: string, status: VisitStatus }`
- [ ] Использовать `useGetPrescriptionsByVisitQuery(visitId)` (создать позже)
- [ ] Отображать DataTable с назначениями
- [ ] Кнопка "+ Добавить назначение" (если status === "IN_PROGRESS")
- [ ] Dialog с формой добавления prescription
- [ ] Кнопки редактирования/удаления в строках

#### detail/visit-lab-orders.tsx
- [ ] Создать `src/features/visit/components/detail/visit-lab-orders.tsx`
- [ ] Props: `{ visitId: string, status: VisitStatus }`
- [ ] Использовать `useGetLabOrdersByVisitQuery(visitId)` (создать позже)
- [ ] Отображать DataTable с направлениями
- [ ] Кнопка "+ Добавить направление" (если status === "IN_PROGRESS")
- [ ] Dialog с формой добавления lab order
- [ ] Badge для статуса анализа

### index.ts
- [ ] Создать `src/features/visit/index.ts`
- [ ] Экспортировать типы через `export type`
- [ ] Экспортировать схемы
- [ ] Экспортировать константы
- [ ] Экспортировать модельные функции
- [ ] Экспортировать API hooks
- [ ] Экспортировать компоненты

### Страницы

#### app/cabinet/visits/page.tsx
- [ ] Создать `src/app/cabinet/visits/page.tsx`
- [ ] "use client" directive
- [ ] Использовать `useGetVisitsQuery` с фильтрами и пагинацией
- [ ] useState для searchTerm, useDebounce
- [ ] DataTable с колонками из `createVisitColumns`
- [ ] Фильтры: статус, дата от/до, врач
- [ ] Кнопка "Начать новый прием" → navigate to create page
- [ ] Обработчики onView, onEdit, onDelete

#### app/cabinet/visits/create/page.tsx
- [ ] Создать `src/app/cabinet/visits/create/page.tsx`
- [ ] "use client" directive
- [ ] Рендерить `<PageVisitForm mode="create" />`
- [ ] LayoutHeader с breadcrumbs

#### app/cabinet/visits/[id]/page.tsx
- [ ] Создать `src/app/cabinet/visits/[id]/page.tsx`
- [ ] "use client" directive
- [ ] Использовать `use(params)` для получения id
- [ ] Загрузить визит через `useGetVisitQuery(id)`
- [ ] Tabs компонент:
  - Tab "Обзор" - VisitOverview
  - Tab "Назначения" - VisitPrescriptions
  - Tab "Анализы" - VisitLabOrders
- [ ] Loading state
- [ ] Not found state
- [ ] LayoutHeader с breadcrumbs и back button

#### app/cabinet/visits/[id]/edit/page.tsx
- [ ] Создать `src/app/cabinet/visits/[id]/edit/page.tsx`
- [ ] "use client" directive
- [ ] Использовать `use(params)` для получения id
- [ ] Рендерить `<PageVisitForm mode="edit" visitId={id} />`

---

## 2️⃣ Feature: Prescription

### Структура файлов
- [ ] Создать директорию `src/features/prescription/`
- [ ] Создать директорию `src/features/prescription/components/`

### prescription.dto.ts
- [ ] Создать `src/features/prescription/prescription.dto.ts`
- [ ] Добавить интерфейсы (совпадают с бэкенд DTO):
  - `PrescriptionResponseDto`
  - `CreatePrescriptionRequestDto`
  - `UpdatePrescriptionRequestDto`
  - `PrescriptionsQueryParamsDto extends QueryParamsDto`
  - `PrescriptionsListResponseDto`

### prescription.schema.ts
- [ ] Создать `src/features/prescription/prescription.schema.ts`
- [ ] Создать `prescriptionFormSchema` с валидацией:
  - name (required, min 2)
  - dosage (optional)
  - frequency (optional)
  - duration (optional)
  - notes (optional)
- [ ] Создать `createPrescriptionRequestSchema`
- [ ] Экспортировать тип `PrescriptionFormData`

### prescription.model.ts
- [ ] Создать `src/features/prescription/prescription.model.ts`
- [ ] Добавить `getEmployeeFullName(prescription: PrescriptionResponseDto): string`
- [ ] Добавить `formatPrescriptionDisplay(prescription: PrescriptionResponseDto): string`

### prescription.api.ts
- [ ] Создать `src/features/prescription/prescription.api.ts`
- [ ] Создать `prescriptionApi = rootApi.injectEndpoints()`
- [ ] Endpoints:
  - `getPrescriptions: builder.query` - провайдить `[API_TAG_PRESCRIPTIONS]`
  - `getPrescription: builder.query` - провайдить с id
  - `getPrescriptionsByVisit: builder.query<PrescriptionResponseDto[], string>` - для конкретного визита
  - `createPrescription: builder.mutation` - инвалидировать `[API_TAG_PRESCRIPTIONS]`
  - `updatePrescription: builder.mutation` - инвалидировать с id
  - `deletePrescription: builder.mutation` - инвалидировать с id
- [ ] Экспортировать все hooks

### Компоненты

#### prescription-form.tsx
- [ ] Создать `src/features/prescription/components/prescription-form.tsx`
- [ ] Props: `{ visitId: string, initialData?: PrescriptionFormData, onSuccess?: () => void, onCancel?: () => void }`
- [ ] useForm с yupResolver
- [ ] Поля:
  - name (Input, required)
  - dosage (Input)
  - frequency (Input)
  - duration (Input)
  - notes (Textarea)
- [ ] Submit с createPrescription или updatePrescription
- [ ] Кнопки "Сохранить" и "Отмена"

#### prescription-columns.tsx
- [ ] Создать `src/features/prescription/components/prescription-columns.tsx`
- [ ] Экспортировать `createPrescriptionColumns(onEdit?, onDelete?)`
- [ ] Колонки:
  - name
  - dosage
  - frequency
  - duration
  - createdAt (форматировать)
  - actions (edit/delete dropdown)

#### prescription-list.tsx
- [ ] Создать `src/features/prescription/components/prescription-list.tsx`
- [ ] Props: `{ visitId: string, status: VisitStatus }`
- [ ] Использовать `useGetPrescriptionsByVisitQuery(visitId)`
- [ ] DataTable с prescription-columns
- [ ] Кнопка "+ Добавить назначение" (если status === "IN_PROGRESS")
- [ ] Dialog с PrescriptionForm
- [ ] useState для управления dialog open/close

### index.ts
- [ ] Создать `src/features/prescription/index.ts`
- [ ] Экспортировать типы, API hooks, компоненты

---

## 3️⃣ Feature: Lab Order

### Структура файлов
- [ ] Создать директорию `src/features/lab-order/`
- [ ] Создать директорию `src/features/lab-order/components/`

### lab-order.dto.ts
- [ ] Создать `src/features/lab-order/lab-order.dto.ts`
- [ ] Добавить type `LabStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"`
- [ ] Добавить интерфейсы:
  - `LabOrderResponseDto`
  - `CreateLabOrderRequestDto`
  - `UpdateLabOrderRequestDto`
  - `UpdateLabOrderStatusRequestDto`
  - `LabOrdersQueryParamsDto`
  - `LabOrdersListResponseDto`

### lab-order.constants.ts
- [ ] Создать `src/features/lab-order/lab-order.constants.ts`
- [ ] Добавить `LAB_STATUS` объект
- [ ] Добавить `LAB_STATUS_OPTIONS` массив
- [ ] Добавить `LAB_STATUS_LABELS: Record<LabStatus, string>`
- [ ] Добавить `LAB_STATUS_COLORS` для Badge

### lab-order.schema.ts
- [ ] Создать `src/features/lab-order/lab-order.schema.ts`
- [ ] Создать `labOrderFormSchema`:
  - testName (required, min 2)
  - notes (optional)
- [ ] Экспортировать `LabOrderFormData`

### lab-order.model.ts
- [ ] Создать `src/features/lab-order/lab-order.model.ts`
- [ ] Добавить `getLabStatusLabel(status: LabStatus): string`
- [ ] Добавить `canUpdateLabStatus(labOrder: LabOrderResponseDto, currentUserRole: string): boolean`

### lab-order.api.ts
- [ ] Создать `src/features/lab-order/lab-order.api.ts`
- [ ] Создать `labOrderApi = rootApi.injectEndpoints()`
- [ ] Endpoints:
  - `getLabOrders: builder.query` - провайдить `[API_TAG_LAB_ORDERS]`
  - `getLabOrder: builder.query` - провайдить с id
  - `getLabOrdersByVisit: builder.query<LabOrderResponseDto[], string>`
  - `createLabOrder: builder.mutation` - инвалидировать
  - `updateLabOrder: builder.mutation` - инвалидировать с id
  - `updateLabOrderStatus: builder.mutation` - инвалидировать с id
  - `deleteLabOrder: builder.mutation` - инвалидировать с id
- [ ] Экспортировать все hooks

### Компоненты

#### lab-order-status-badge.tsx
- [ ] Создать `src/features/lab-order/components/lab-order-status-badge.tsx`
- [ ] Props: `{ status: LabStatus }`
- [ ] Badge с цветом из LAB_STATUS_COLORS
- [ ] Label из LAB_STATUS_LABELS

#### lab-order-form.tsx
- [ ] Создать `src/features/lab-order/components/lab-order-form.tsx`
- [ ] Props: `{ visitId: string, initialData?, onSuccess?, onCancel? }`
- [ ] Поля:
  - testName (Input, required)
  - notes (Textarea)
- [ ] Submit с createLabOrder или updateLabOrder

#### lab-order-columns.tsx
- [ ] Создать `src/features/lab-order/components/lab-order-columns.tsx`
- [ ] Экспортировать `createLabOrderColumns(onEdit?, onDelete?, onUpdateStatus?)`
- [ ] Колонки:
  - testName
  - status (с LabOrderStatusBadge)
  - createdAt
  - actions (edit/delete/update status dropdown)

#### lab-order-list.tsx
- [ ] Создать `src/features/lab-order/components/lab-order-list.tsx`
- [ ] Props: `{ visitId: string, status: VisitStatus }`
- [ ] Использовать `useGetLabOrdersByVisitQuery(visitId)`
- [ ] DataTable с lab-order-columns
- [ ] Кнопка "+ Добавить направление" (если visit status === "IN_PROGRESS")
- [ ] Dialog с LabOrderForm
- [ ] Dialog для обновления статуса анализа

### index.ts
- [ ] Создать `src/features/lab-order/index.ts`
- [ ] Экспортировать всё необходимое

---

## 4️⃣ Интеграция с Appointment

### Обновление appointment feature
- [ ] Открыть `src/features/appointment/components/appointment-columns.tsx`
- [ ] Добавить кнопку "Начать прием" в actions dropdown для записей со статусом SCHEDULED или IN_QUEUE
- [ ] Обработчик кнопки должен:
  - Создавать новый Visit через `useCreateVisitMutation`
  - Передавать appointmentId в CreateVisitDto
  - Перенаправлять на страницу деталей созданного визита
  - Backend автоматически обновит Appointment.status на IN_PROGRESS

### Обновление appointment detail page
- [ ] Открыть `src/app/cabinet/appointments/[id]/page.tsx`
- [ ] Если у appointment есть связанный visit (visits массив), отобразить:
  - Секцию "Связанный визит"
  - Статус визита
  - Ссылку на страницу визита
- [ ] Кнопка "Начать прием" если нет связанного визита и статус позволяет

---

## 5️⃣ Общие улучшения

### Типы и утилиты
- [ ] Проверить что `PaginatedResponseDto` и `QueryParamsDto` существуют в `@/types/api.types`
- [ ] Добавить утилиты форматирования дат если нужно

### Navigation
- [ ] Добавить пункт "Визиты" в sidebar navigation
- [ ] Обновить breadcrumbs для новых страниц

### Permissions
- [ ] Добавить проверку permissions на страницах:
  - visits:READ для списка и деталей
  - visits:CREATE для создания
  - visits:UPDATE для редактирования
  - visits:DELETE для удаления
- [ ] Скрывать кнопки действий если нет permission

---

## 🧪 Тестирование

### Функциональное тестирование
- [ ] Создать визит без appointment (Walk-in)
- [ ] Создать визит с appointment
- [ ] Проверить что Appointment.status обновляется при создании Visit
- [ ] Добавить назначения к визиту
- [ ] Добавить направления на анализы
- [ ] Обновить статус анализа
- [ ] Завершить визит
- [ ] Проверить что Appointment.status обновляется при завершении Visit
- [ ] Отменить визит
- [ ] Проверить редактирование визита (только если IN_PROGRESS)
- [ ] Проверить что завершенный визит нельзя редактировать
- [ ] Проверить фильтрацию списка визитов
- [ ] Проверить пагинацию
- [ ] Проверить историю визитов пациента (если реализовано)

### Permissions тестирование
- [ ] Войти как DOCTOR - должны быть все права
- [ ] Войти как NURSE - должны быть ограниченные права
- [ ] Войти как RECEPTIONIST - только чтение

---

## 📝 Документация
- [ ] Обновить README с новыми features
- [ ] Добавить скриншоты UI (опционально)
- [ ] Документировать API endpoints (если отдельный API docs файл)

---

## Приоритеты

### Must Have (Критично):
1. Visit feature (полностью)
2. Prescription feature
3. Lab Order feature
4. Интеграция с Appointment

### Should Have (Важно):
- История визитов в профиле пациента
- Расширенные фильтры
- Экспорт данных

### Nice to Have (Желательно):
- Печать протокола визита
- Шаблоны назначений
- Быстрое добавление часто используемых препаратов
