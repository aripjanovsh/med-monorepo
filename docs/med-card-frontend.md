## 🧩 Общая структура и логика

- `Appointment` — это **запись** пациента к врачу (назначенное время, дата, врач, кабинет, тип приёма и т.д.)
- `Visit` — это **фактический приём** (врач вносит анамнез, жалобы, осмотр, назначает лечение, протокол и т.д.)

Один `appointment` может привести к одному `visit`.
Но `visit` может существовать и без `appointment` (например, при визите "без записи", через живую очередь).

---

## 🗂️ Backend структура (Prisma schema, логика, API)

### 1. Appointment (запись к врачу)

```prisma
model Appointment {
  id             String     @id @default(uuid())
  patientId      String
  patient        Patient    @relation(fields: [patientId], references: [id])

  doctorId       String
  doctor         User       @relation(fields: [doctorId], references: [id])

  appointmentDate DateTime  // Назначенная дата и время
  status         AppointmentStatus @default(SCHEDULED)
  type           AppointmentType   @default(CONSULTATION)
  notes          String?

  visitId        String?    // связь с фактическим визитом
  visit          Visit?     @relation(fields: [visitId], references: [id])

  queueNumber    Int?       // если пациент пришёл без записи и попал в очередь
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@index([appointmentDate])
  @@map("appointments")
}

enum AppointmentStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW // не пришёл
}

enum AppointmentType {
  CONSULTATION
  FOLLOW_UP
  EMERGENCY
  QUEUE // живой визит без записи
}
```

---

### 2. Visit (фактический приём)

```prisma
model Visit {
  id              String   @id @default(uuid())
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])

  doctorId        String
  doctor          User     @relation(fields: [doctorId], references: [id])

  appointmentId   String?
  appointment     Appointment? @relation(fields: [appointmentId], references: [id])

  startedAt       DateTime  @default(now())
  finishedAt      DateTime?
  status          VisitStatus @default(IN_PROGRESS)
  reason          String?   // причина обращения (жалоба)
  anamnesis       String?   // анамнез
  objectiveData   String?   // данные осмотра
  diagnosis       String?   // диагноз
  recommendations String?   // рекомендации
  protocolId      String?   // ссылка на шаблон протокола
  protocolTemplate ProtocolTemplate? @relation(fields: [protocolId], references: [id])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  @@map("visits")
}

enum VisitStatus {
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## ⚙️ Backend — API роуты и логика

| Endpoint                    | Метод                                                         | Описание |
| --------------------------- | ------------------------------------------------------------- | -------- |
| `POST /appointments`        | Создать запись к врачу                                        |          |
| `GET /appointments`         | Список записей (по дате, врачу, пациенту, статусу)            |          |
| `PATCH /appointments/:id`   | Обновить статус, дату, врача                                  |          |
| `POST /visits`              | Создать визит (вручную или на основе appointment)             |          |
| `GET /visits`               | Список визитов по дате, врачу, пациенту                       |          |
| `PATCH /visits/:id`         | Обновить данные приёма (анамнез, диагноз, протокол и т.п.)    |          |
| `GET /protocol-templates`   | Получить шаблоны протоколов                                   |          |
| `POST /visits/:id/complete` | Завершить визит (меняет статус, фиксирует время `finishedAt`) |          |

---

## 🖥️ Frontend — функциональные экраны и формы

### 1. **Ресепшен панель**

- **Цель:** запись пациента к врачу, просмотр очереди, изменение статуса
- **Форма добавления Appointment:**
  - Пациент (поиск или создание)
  - Врач (select)
  - Дата и время
  - Тип приёма (обычный, повторный, экстренный)
  - Комментарий
  - [Кнопка] “Добавить в очередь” → `AppointmentType = QUEUE`

---

### 2. **Очередь / расписание врача**

- Таблица/календарь:
  - Имя пациента
  - Время
  - Статус (ожидает, на приёме, завершён)

- Врач может нажать “Начать приём” → создаётся `Visit` с `status = IN_PROGRESS`

---

### 3. **Экран визита (для врача)**

- Данные пациента (ФИО, возраст, история визитов)
- Поля формы визита:
  - Жалобы (`reason`)
  - Анамнез (`anamnesis`)
  - Осмотр (`objectiveData`)
  - Диагноз (`diagnosis`)
  - Рекомендации (`recommendations`)
  - Выбор шаблона протокола (`protocolTemplateId`)

- После заполнения врач нажимает **“Завершить приём”** → `Visit.status = COMPLETED`, `finishedAt = now()`

---

### 4. **История пациента**

- Таб с предыдущими визитами (`visits`)
- По клику — открывается карточка визита с полным протоколом
- Можно распечатать или экспортировать (PDF позже)

---

## 🔄 Технический Flow (end-to-end)

1. **Ресепшен** создаёт `Appointment` (через форму).
   → `Appointment.status = SCHEDULED`

2. **Пациент приходит.**
   → Ресепшен меняет `Appointment.status = IN_PROGRESS`
   → Либо врач нажимает “Начать приём” — создаётся `Visit`, связанный с этим `Appointment`

3. **Врач открывает `Visit`**
   → Заполняет жалобы, анамнез, осмотр, диагноз
   → Может выбрать шаблон протокола (`ProtocolTemplate`)

4. **После завершения**
   → `Visit.status = COMPLETED`
   → `Appointment.status = COMPLETED`
   → Медкарта пациента обновляется

---

## 🖥️ Frontend — Архитектура и Компоненты

### 📂 Feature Structure (следуя frontend-guide.md)

Каждый feature модуль должен иметь:

```
features/[feature]/
├── components/
│   ├── [feature]-columns.tsx    # Table columns
│   ├── [feature]-form.tsx       # Form logic
│   └── [feature]-list.tsx       # List component
├── [feature].api.ts             # RTK Query endpoints
├── [feature].dto.ts             # TypeScript types (match backend)
├── [feature].constants.ts       # Enums, options
├── [feature].schema.ts          # Yup validation
├── [feature].model.ts           # Helper functions
└── index.ts                     # Public exports
```

---

## 🗂️ Features для реализации

### 1. **Feature: Visit**

**Backend API:** `/api/v1/visits`

**Структура:**
```
features/visit/
├── components/
│   ├── visit-columns.tsx
│   ├── visit-form.tsx
│   ├── page-visit-form.tsx
│   ├── visit-status-badge.tsx
│   └── detail/
│       ├── visit-overview.tsx
│       ├── visit-prescriptions.tsx
│       └── visit-lab-orders.tsx
├── visit.api.ts                 # getVisits, createVisit, updateVisit, updateVisitStatus
├── visit.dto.ts                 # VisitResponseDto, CreateVisitRequestDto, etc.
├── visit.constants.ts           # VISIT_STATUS, VISIT_STATUS_OPTIONS
├── visit.schema.ts              # visitFormSchema
├── visit.model.ts               # getPatientFullName, isVisitEditable
└── index.ts
```

**Страницы:**
- `/cabinet/visits` - Список визитов
- `/cabinet/visits/create` - Начать прием
- `/cabinet/visits/[id]` - Детали визита (с вкладками: обзор, назначения, анализы)
- `/cabinet/visits/[id]/edit` - Редактировать визит

---

### 2. **Feature: Prescription**

**Backend API:** `/api/v1/prescriptions`

**Структура:**
```
features/prescription/
├── components/
│   ├── prescription-columns.tsx
│   ├── prescription-form.tsx
│   └── prescription-list.tsx    # Для отображения в Visit detail
├── prescription.api.ts          # getPrescriptions, createPrescription, etc.
├── prescription.dto.ts          # PrescriptionResponseDto
├── prescription.schema.ts       # prescriptionFormSchema
├── prescription.model.ts
└── index.ts
```

**Интеграция:** Отображается внутри Visit detail page как вложенный компонент

---

### 3. **Feature: Lab Order**

**Backend API:** `/api/v1/lab-orders`

**Структура:**
```
features/lab-order/
├── components/
│   ├── lab-order-columns.tsx
│   ├── lab-order-form.tsx
│   ├── lab-order-list.tsx
│   └── lab-order-status-badge.tsx
├── lab-order.api.ts             # getLabOrders, createLabOrder, updateLabOrderStatus
├── lab-order.dto.ts             # LabOrderResponseDto
├── lab-order.constants.ts       # LAB_STATUS, LAB_STATUS_OPTIONS
├── lab-order.schema.ts
├── lab-order.model.ts
└── index.ts
```

**Интеграция:** Отображается внутри Visit detail page

---

### 4. **Обновление Feature: Appointment**

**Изменения:**
- Добавить кнопку "Начать прием" для записей со статусом `SCHEDULED` или `IN_QUEUE`
- При клике создавать новый Visit с `appointmentId`
- Отображать связанный Visit в деталях Appointment
- Автоматическое обновление статуса через бэкенд

---

## 🎯 Ключевые UI Компоненты

### **VisitForm** (visit-form.tsx)
- Patient selector (autocomplete)
- Employee selector (autocomplete врачей)
- Appointment selector (optional, autocomplete)
- Protocol template selector (optional)
- Visit date picker
- Notes textarea

### **VisitDetail** (app/cabinet/visits/[id]/page.tsx)
Вкладки:
1. **Обзор** - Patient info, Employee info, Visit info
2. **Назначения** - PrescriptionList с кнопкой добавления
3. **Анализы** - LabOrderList с кнопкой добавления

### **PrescriptionList** (prescription-list.tsx)
- DataTable с колонками: Препарат, Дозировка, Частота, Длительность
- Кнопка "+ Добавить назначение"
- Dialog с PrescriptionForm
- Доступно только если Visit.status === "IN_PROGRESS"

### **LabOrderList** (lab-order-list.tsx)
- DataTable с колонками: Анализ, Статус, Дата создания
- Кнопка "+ Добавить направление"
- Dialog с LabOrderForm
- Badge для статуса с цветовой индикацией

---

## 🔄 User Flow

### **Reception Flow:**
1. Receptionist создает Appointment через `/cabinet/appointments/create`
2. Appointment.status = "SCHEDULED"
3. В день приема статус меняется на "IN_QUEUE"

### **Doctor Flow:**
1. Врач видит список appointments со статусом "IN_QUEUE"
2. Нажимает "Начать прием" → создается Visit
3. Открывается `/cabinet/visits/[id]`
4. Заполняет информацию, добавляет назначения и анализы
5. Нажимает "Завершить прием" → Visit.status = "COMPLETED"
6. Backend автоматически обновляет Appointment.status = "COMPLETED"

### **Patient History:**
- В деталях пациента вкладка "История визитов"
- Список всех Visit с возможностью просмотра
- Фильтры по дате, врачу, статусу

---

## 📋 API Tags для RTK Query

Добавить в `constants/api-tags.constants.ts`:

```typescript
export const API_TAG_VISITS = "Visits" as const;
export const API_TAG_PRESCRIPTIONS = "Prescriptions" as const;
export const API_TAG_LAB_ORDERS = "LabOrders" as const;
```

---

## 🔐 Permissions

Добавить в систему permissions:

```typescript
// Visits
visits:CREATE
visits:READ
visits:UPDATE
visits:DELETE

// Prescriptions
prescriptions:CREATE
prescriptions:READ
prescriptions:UPDATE
prescriptions:DELETE

// Lab Orders
lab-orders:CREATE
lab-orders:READ
lab-orders:UPDATE
lab-orders:DELETE
```

**Role mapping:**
- **DOCTOR**: все permissions для visits, prescriptions, lab-orders
- **NURSE**: READ для всех, CREATE/UPDATE для lab-orders
- **RECEPTIONIST**: READ для appointments и visits
- **ADMIN**: все permissions
