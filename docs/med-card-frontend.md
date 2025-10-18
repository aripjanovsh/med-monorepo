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
