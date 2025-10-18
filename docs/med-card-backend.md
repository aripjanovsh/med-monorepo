# 🧩 Backend Roadmap — Медкарта пациента

---

## I. Модели данных (Prisma Schema)

### ✅ 1. Appointment (запись к врачу)

```prisma
model Appointment {
  id             String   @id @default(uuid())
  patientId      String
  patient        Patient  @relation(fields: [patientId], references: [id])
  doctorId       String
  doctor         Doctor   @relation(fields: [doctorId], references: [id])
  scheduledAt    DateTime
  status         AppointmentStatus @default(SCHEDULED)
  type           AppointmentType   @default(STANDARD)
  visitId        String?
  visit          Visit?   @relation(fields: [visitId], references: [id])
  notes          String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@map("appointments")
}

enum AppointmentStatus {
  SCHEDULED     // запланирован
  IN_QUEUE      // в очереди
  IN_PROGRESS   // пациент на приёме
  COMPLETED     // завершён
  CANCELED      // отменён
  NO_SHOW       // не пришёл
}

enum AppointmentType {
  STANDARD      // обычная запись
  WITHOUT_QUEUE // без очереди
  EMERGENCY     // экстренно
}
```

---

### ✅ 2. Visit (медицинский визит)

```prisma
model Visit {
  id             String   @id @default(uuid())
  appointmentId  String?
  appointment    Appointment? @relation(fields: [appointmentId], references: [id])
  patientId      String
  patient        Patient  @relation(fields: [patientId], references: [id])
  doctorId       String
  doctor         Doctor   @relation(fields: [doctorId], references: [id])
  visitDate      DateTime @default(now())
  status         VisitStatus @default(IN_PROGRESS)
  protocolId     String?
  protocol       ProtocolTemplate? @relation(fields: [protocolId], references: [id])
  notes          String?

  medicalRecords MedicalRecord[]
  prescriptions  Prescription[]
  labOrders      LabOrder[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@map("visits")
}

enum VisitStatus {
  IN_PROGRESS
  COMPLETED
  CANCELED
}
```

---

### ✅ 3. MedicalRecord (структурированные записи по шаблонам)

```prisma
model MedicalRecord {
  id          String   @id @default(uuid())
  visitId     String
  visit       Visit    @relation(fields: [visitId], references: [id])
  type        RecordType
  content     Json // хранит заполненные данные по шаблону ProtocolTemplate
  createdAt   DateTime @default(now())
  createdById String
  createdBy   Doctor @relation(fields: [createdById], references: [id])

  @@map("medical_records")
}

enum RecordType {
  COMPLAINTS     // жалобы
  EXAMINATION    // осмотр
  DIAGNOSIS      // диагноз
  PRESCRIPTION   // назначения
  LAB_ORDER      // направление на анализ
  NOTE           // дополнительные записи
}
```

---

### ✅ 4. Prescription (назначенные лекарства)

```prisma
model Prescription {
  id          String   @id @default(uuid())
  visitId     String
  visit       Visit    @relation(fields: [visitId], references: [id])
  name        String   // название препарата
  dosage      String?  // дозировка
  frequency   String?  // частота приёма
  duration    String?  // длительность
  notes       String?

  createdAt   DateTime @default(now())
  createdById String
  createdBy   Doctor @relation(fields: [createdById], references: [id])

  @@map("prescriptions")
}
```

---

### ✅ 5. LabOrder (назначение на анализ / обследование)

```prisma
model LabOrder {
  id          String   @id @default(uuid())
  visitId     String
  visit       Visit    @relation(fields: [visitId], references: [id])
  testName    String
  status      LabStatus @default(PENDING)
  createdAt   DateTime @default(now())
  createdById String
  createdBy   Doctor @relation(fields: [createdById], references: [id])

  @@map("lab_orders")
}

enum LabStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

---

## II. API (NestJS backend)

### ✅ 1. AppointmentController

- `POST /appointments` — создать запись
  → вход: `{ patientId, doctorId, scheduledAt, type, notes }`
- `GET /appointments?date=...` — список на день
- `PATCH /appointments/:id/status` — изменить статус
- `GET /appointments/:id` — получить детали

**Роли:** `receptionist`, `doctor`, `admin`

---

### ✅ 2. VisitController

- `POST /visits` — начать приём
  → вход: `{ appointmentId, patientId, doctorId, protocolId?, notes? }`
- `GET /visits/:id` — получить визит с записями и назначениями
- `PATCH /visits/:id/status` — завершить визит (`status = COMPLETED`)

**Логика:**
Когда `Visit` создаётся → `Appointment.status = IN_PROGRESS`
Когда `Visit` завершается → `Appointment.status = COMPLETED`

---

### ✅ 3. MedicalRecordController

- `POST /records` — добавить запись (complaint, diagnosis и т.д.)
  → `{ visitId, type, content }`
- `GET /records/visit/:visitId` — получить все записи визита
- `DELETE /records/:id` — удалить запись (если не завершён визит)

---

### ✅ 4. PrescriptionController

- `POST /prescriptions` — добавить лекарство
  → `{ visitId, name, dosage?, frequency?, duration?, notes? }`
- `GET /prescriptions/visit/:visitId`
- `DELETE /prescriptions/:id`

---

### ✅ 5. LabOrderController

- `POST /lab-orders` — добавить назначение на анализ
  → `{ visitId, testName }`
- `GET /lab-orders/visit/:visitId`
- `PATCH /lab-orders/:id/status` — обновить статус (например, `IN_PROGRESS`)

---

## III. Роли и доступы

| Роль                      | Может делать                                                              |
| ------------------------- | ------------------------------------------------------------------------- |
| **Receptionist**          | Создавать пациентов, appointments, ставить в очередь                      |
| **Doctor**                | Просматривать appointments, начинать визиты, добавлять записи, назначения |
| **Admin**                 | Управлять пользователями, шаблонами протоколов                            |
| **Nurse** _(опционально)_ | Просматривать назначения, помогать с LabOrder                             |

---

## IV. Взаимодействие данных (flow)

### 🧾 1. Reception Flow

1. Проверяет пациента
2. Создаёт `Appointment`
3. Назначает дату и врача
4. Пациент получает статус `SCHEDULED`
5. В день приёма → `IN_QUEUE`

---

### 🩺 2. Doctor Flow

1. Врач открывает список `IN_QUEUE` / `SCHEDULED` пациентов
2. Нажимает "Начать приём" → создаётся `Visit`
3. Выбирает шаблон протокола (если нужно)
4. Заполняет жалобы, осмотр, диагноз и назначения (через `MedicalRecord`)
5. Добавляет лекарства (`Prescription`) и анализы (`LabOrder`)
6. После завершения → `Visit.status = COMPLETED`, `Appointment.status = COMPLETED`

---

### 📊 3. Структура данных по итогам визита

```
Patient
 └─ Appointment
     └─ Visit
         ├─ MedicalRecords[]
         ├─ Prescriptions[]
         └─ LabOrders[]
```

---

## V. Особенности реализации

- Все операции изолированы по `organizationId`
- Все даты хранятся в UTC, форматируются на клиенте
- Без файлов и без внешних API
- В будущем можно добавить:
  - `billing` (оплата)
  - `labResults`
  - `documents` (загрузки, прикрепления)
  - `notifications` (email/SMS)

---

## ✅ Резюме для AI-агента (исполнение по шагам)

```
[ ] Создать модели Appointment, Visit, MedicalRecord, Prescription, LabOrder
[ ] Прописать enum'ы для статусов и типов
[ ] Реализовать контроллеры и сервисы для каждой модели
[ ] Добавить Prisma migrations
[ ] Реализовать связи organizationId и access-control
[ ] Реализовать Appointment flow (SCHEDULED → IN_QUEUE → IN_PROGRESS → COMPLETED)
[ ] Реализовать Visit flow (создание, заполнение записей, завершение)
[ ] Проверить корректность обновления статусов между Appointment и Visit
[ ] Протестировать CRUD по всем сущностям
```
