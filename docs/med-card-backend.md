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

## II. API (NestJS Backend) - Архитектура и Стандарты

### 🏗️ Общие требования к модулям

#### DTO Структура

Каждый модуль должен иметь:

1. **Create DTO** - с декораторами:
   - `@Exclude()` на уровне класса
   - `@Expose()` для каждого поля
   - `@InjectOrganizationId()` для автоматической инъекции organizationId
   - `@TransformEmpty()` для optional UUID полей
   - `@TransformDate()` для дат
   - `@ApiProperty()` для Swagger документации

2. **Update DTO** - наследуется от `PartialType(CreateDto)` с дополнительными полями

3. **FindAll DTO** - с пагинацией:
   - `page`, `limit`, `sortBy`, `sortOrder`
   - `organizationId` (инъецируется автоматически)
   - Специфичные фильтры для модуля

4. **Response DTO** - наследуется от `BaseResponseDto`:
   - `@Exclude()` на уровне класса
   - `@Expose()` для каждого поля
   - `@Type()` для вложенных объектов
   - `@TransformDecimal()` для Decimal полей

#### Service Layer

- Использовать `plainToInstance()` для трансформации Prisma результатов
- Использовать `$transaction` для сложных операций
- Валидация tenant isolation через `organizationId` в where conditions
- Все трансформации данных происходят в DTO

#### Controller Layer

- Guards: `@UseGuards(AuthGuard('jwt'), PermissionGuard)`
- Permissions: `@RequirePermission({ resource: 'visits', action: 'CREATE' })`
- Swagger документация: `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`

---

### ✅ 1. AppointmentController

**Endpoints:**

```typescript
POST   /appointments           - Создать запись
GET    /appointments           - Список с фильтрами и пагинацией
GET    /appointments/:id       - Детали записи
PATCH  /appointments/:id       - Обновить запись
PATCH  /appointments/:id/status - Изменить статус
DELETE /appointments/:id       - Удалить запись
```

**DTO структура:**

```typescript
// CreateAppointmentDto
{
  organizationId: string;  // @InjectOrganizationId()
  patientId: string;
  employeeId: string;      // doctorId (врач - это Employee)
  scheduledAt: DateTime;
  duration: number;
  type: AppointmentType;   // STANDARD | WITHOUT_QUEUE | EMERGENCY
  serviceId?: string;      // @TransformEmpty()
  reason?: string;
  notes?: string;
}

// FindAllAppointmentDto
{
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  organizationId: string;  // @InjectOrganizationId()
  date?: Date;             // фильтр по дате
  status?: AppointmentStatus;
  patientId?: string;
  employeeId?: string;
}

// AppointmentResponseDto extends BaseResponseDto
{
  id: string;
  appointmentId?: string;
  scheduledAt: DateTime;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason?: string;
  notes?: string;
  patient: PatientResponseDto;      // @Type(() => PatientResponseDto)
  employee: EmployeeResponseDto;    // @Type(() => EmployeeResponseDto)
  service?: ServiceResponseDto;
  visit?: VisitResponseDto;         // если визит создан
  organization: OrganizationResponseDto;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**Permissions:** `appointments:CREATE`, `appointments:READ`, `appointments:UPDATE`, `appointments:DELETE`

**Roles:** `RECEPTIONIST`, `DOCTOR`, `ADMIN`

---

### ✅ 2. VisitController

**Endpoints:**

```typescript
POST   /visits           - Начать приём (создать визит)
GET    /visits           - Список визитов с пагинацией
GET    /visits/:id       - Детали визита с записями и назначениями
PATCH  /visits/:id       - Обновить визит
PATCH  /visits/:id/status - Завершить/отменить визит
DELETE /visits/:id       - Удалить визит
```

**DTO структура:**

```typescript
// CreateVisitDto
{
  organizationId: string;  // @InjectOrganizationId()
  appointmentId?: string;  // @TransformEmpty() - опционально, можно без записи
  patientId: string;
  employeeId: string;      // doctorId (врач - это Employee)
  visitDate: DateTime;     // @TransformDate(), default now()
  protocolId?: string;     // @TransformEmpty() - шаблон протокола
  notes?: string;
}

// FindAllVisitDto
{
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  organizationId: string;  // @InjectOrganizationId()
  status?: VisitStatus;
  patientId?: string;
  employeeId?: string;     // фильтр по врачу
  dateFrom?: Date;         // @TransformDate()
  dateTo?: Date;           // @TransformDate()
}

// UpdateVisitStatusDto
{
  organizationId: string;  // @InjectOrganizationId()
  status: VisitStatus;     // IN_PROGRESS | COMPLETED | CANCELED
}

// VisitResponseDto extends BaseResponseDto
{
  id: string;
  visitDate: DateTime;
  status: VisitStatus;
  notes?: string;
  appointment?: AppointmentResponseDto;  // @Type()
  patient: PatientResponseDto;           // @Type()
  employee: EmployeeResponseDto;         // @Type() - врач
  protocol?: ProtocolTemplateResponseDto; // @Type()
  medicalRecords: MedicalRecordResponseDto[]; // @Type()
  prescriptions: PrescriptionResponseDto[];   // @Type()
  labOrders: LabOrderResponseDto[];           // @Type()
  organization: OrganizationResponseDto;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**Business Logic:**
- При создании `Visit` → обновить `Appointment.status = IN_PROGRESS`
- При завершении `Visit` → обновить `Appointment.status = COMPLETED`
- Использовать `$transaction` для атомарности операций

**Permissions:** `visits:CREATE`, `visits:READ`, `visits:UPDATE`, `visits:DELETE`

**Roles:** `DOCTOR`, `ADMIN`

---

### ✅ 3. MedicalRecordController

**Endpoints:**

```typescript
POST   /medical-records         - Добавить запись
GET    /medical-records         - Список записей с фильтрами
GET    /medical-records/:id     - Детали записи
GET    /medical-records/visit/:visitId - Все записи визита
PATCH  /medical-records/:id     - Обновить запись
DELETE /medical-records/:id     - Удалить запись (если визит не завершён)
```

**DTO структура:**

```typescript
// CreateMedicalRecordDto
{
  organizationId: string;  // @InjectOrganizationId()
  visitId: string;
  type: RecordType;        // COMPLAINTS | EXAMINATION | DIAGNOSIS | etc.
  content: Json;           // структурированные данные по шаблону
  createdById: string;     // врач, создавший запись
}

// FindAllMedicalRecordDto
{
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  organizationId: string;  // @InjectOrganizationId()
  visitId?: string;        // фильтр по визиту
  patientId?: string;      // фильтр по пациенту
  type?: RecordType;       // фильтр по типу записи
  employeeId?: string;     // фильтр по врачу
}

// MedicalRecordResponseDto extends BaseResponseDto
{
  id: string;
  type: RecordType;
  content: Json;
  visit: VisitResponseDto;       // @Type()
  createdBy: EmployeeResponseDto; // @Type() - врач
  createdAt: DateTime;
}
```

**Business Logic:**
- Запись можно удалить только если `Visit.status != COMPLETED`
- Content валидируется на основе ProtocolTemplate если protocolId указан

**Permissions:** `medical-records:CREATE`, `medical-records:READ`, `medical-records:UPDATE`, `medical-records:DELETE`

**Roles:** `DOCTOR`, `ADMIN`

---

### ✅ 4. PrescriptionController

**Endpoints:**

```typescript
POST   /prescriptions           - Добавить назначение лекарства
GET    /prescriptions           - Список назначений с фильтрами
GET    /prescriptions/:id       - Детали назначения
GET    /prescriptions/visit/:visitId - Все назначения визита
PATCH  /prescriptions/:id       - Обновить назначение
DELETE /prescriptions/:id       - Удалить назначение
```

**DTO структура:**

```typescript
// CreatePrescriptionDto
{
  visitId: string;
  name: string;            // название препарата
  dosage?: string;         // дозировка
  frequency?: string;      // частота приёма
  duration?: string;       // длительность
  notes?: string;
  createdById: string;     // врач
}

// FindAllPrescriptionDto
{
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  visitId?: string;
  patientId?: string;
  employeeId?: string;     // фильтр по врачу
}

// PrescriptionResponseDto extends BaseResponseDto
{
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
  visit: VisitResponseDto;       // @Type()
  createdBy: EmployeeResponseDto; // @Type()
  createdAt: DateTime;
}
```

**Permissions:** `prescriptions:CREATE`, `prescriptions:READ`, `prescriptions:UPDATE`, `prescriptions:DELETE`

**Roles:** `DOCTOR`, `ADMIN`

---

### ✅ 5. LabOrderController

**Endpoints:**

```typescript
POST   /lab-orders              - Добавить направление на анализ
GET    /lab-orders              - Список направлений с фильтрами
GET    /lab-orders/:id          - Детали направления
GET    /lab-orders/visit/:visitId - Все направления визита
PATCH  /lab-orders/:id          - Обновить направление
PATCH  /lab-orders/:id/status   - Обновить статус
DELETE /lab-orders/:id          - Удалить направление
```

**DTO структура:**

```typescript
// CreateLabOrderDto
{
  visitId: string;
  testName: string;
  notes?: string;
  createdById: string;     // врач
}

// UpdateLabOrderStatusDto
{
  status: LabStatus;       // PENDING | IN_PROGRESS | COMPLETED
}

// FindAllLabOrderDto
{
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: LabStatus;
  visitId?: string;
  patientId?: string;
  employeeId?: string;     // фильтр по врачу
}

// LabOrderResponseDto extends BaseResponseDto
{
  id: string;
  testName: string;
  status: LabStatus;
  notes?: string;
  visit: VisitResponseDto;       // @Type()
  createdBy: EmployeeResponseDto; // @Type()
  createdAt: DateTime;
}
```

**Permissions:** `lab-orders:CREATE`, `lab-orders:READ`, `lab-orders:UPDATE`, `lab-orders:DELETE`

**Roles:** `DOCTOR`, `NURSE`, `ADMIN`

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

## VI. Детальный план реализации

### Шаг 1: Обновление Prisma Schema

```typescript
[ ] Добавить AppointmentType enum (STANDARD, WITHOUT_QUEUE, EMERGENCY)
[ ] Обновить Appointment модель:
    - Добавить поле type: AppointmentType
    - Изменить поле doctor на employeeId (врач - это Employee)
    - Добавить связь visits Visit[] (один appointment может иметь несколько попыток визита)
    - Обновить status enum (добавить IN_QUEUE если отсутствует)
[ ] Создать Visit модель
[ ] Обновить MedicalRecord модель:
    - Изменить appointmentId на visitId
    - Добавить type: RecordType
    - Изменить content на Json
    - Изменить doctorId на createdById (employeeId)
[ ] Создать Prescription модель
[ ] Создать LabOrder модель
[ ] Добавить enum VisitStatus, RecordType, LabStatus
```

### Шаг 2: Создание модулей NestJS

#### Visit Module
```typescript
[ ] Создать /modules/visit/
[ ] dto/create-visit.dto.ts - с @InjectOrganizationId()
[ ] dto/update-visit.dto.ts
[ ] dto/find-all-visit.dto.ts - с пагинацией
[ ] dto/update-visit-status.dto.ts
[ ] dto/visit-response.dto.ts - extends BaseResponseDto
[ ] visit.controller.ts - с guards и permissions
[ ] visit.service.ts - с transactions и plainToInstance
[ ] visit.module.ts
```

#### Prescription Module
```typescript
[ ] Создать /modules/prescription/
[ ] dto/create-prescription.dto.ts
[ ] dto/update-prescription.dto.ts
[ ] dto/find-all-prescription.dto.ts
[ ] dto/prescription-response.dto.ts
[ ] prescription.controller.ts
[ ] prescription.service.ts
[ ] prescription.module.ts
```

#### LabOrder Module
```typescript
[ ] Создать /modules/lab-order/
[ ] dto/create-lab-order.dto.ts
[ ] dto/update-lab-order.dto.ts
[ ] dto/update-lab-order-status.dto.ts
[ ] dto/find-all-lab-order.dto.ts
[ ] dto/lab-order-response.dto.ts
[ ] lab-order.controller.ts
[ ] lab-order.service.ts
[ ] lab-order.module.ts
```

#### MedicalRecord Module (обновление)
```typescript
[ ] Обновить /modules/medical-record/ если существует
[ ] Или создать новый модуль с правильной структурой
[ ] dto/create-medical-record.dto.ts
[ ] dto/update-medical-record.dto.ts
[ ] dto/find-all-medical-record.dto.ts
[ ] dto/medical-record-response.dto.ts
[ ] medical-record.controller.ts
[ ] medical-record.service.ts
[ ] medical-record.module.ts
```

### Шаг 3: Обновление Appointment Module

```typescript
[ ] Обновить dto/create-appointment.dto.ts:
    - Добавить поле type: AppointmentType
    - Убедиться что используется @InjectOrganizationId()
[ ] Обновить dto/update-appointment.dto.ts
[ ] Создать dto/update-appointment-status.dto.ts
[ ] Обновить dto/appointment-response.dto.ts:
    - Добавить поле type
    - Добавить поле visits (массив визитов)
[ ] Обновить appointment.service.ts:
    - Добавить логику обработки type
    - Добавить метод updateStatus
[ ] Обновить appointment.controller.ts:
    - Добавить endpoint PATCH /:id/status
```

### Шаг 4: Добавление permissions

```typescript
[ ] Добавить permissions в базу:
    - visits:CREATE, visits:READ, visits:UPDATE, visits:DELETE
    - prescriptions:CREATE, prescriptions:READ, prescriptions:UPDATE, prescriptions:DELETE
    - lab-orders:CREATE, lab-orders:READ, lab-orders:UPDATE, lab-orders:DELETE
    - medical-records:CREATE, medical-records:READ, medical-records:UPDATE, medical-records:DELETE
[ ] Назначить permissions ролям:
    - DOCTOR: все permissions для visits, prescriptions, lab-orders, medical-records
    - NURSE: READ для всех, CREATE/UPDATE для lab-orders
    - RECEPTIONIST: READ для appointments
    - ADMIN: все permissions
```

### Шаг 5: Business Logic

```typescript
[ ] Visit Service:
    - create(): при создании обновить Appointment.status = IN_PROGRESS
    - updateStatus(): при COMPLETED обновить Appointment.status = COMPLETED
    - Использовать $transaction для атомарности
[ ] MedicalRecord Service:
    - Проверка что Visit не завершён при delete
[ ] Все сервисы:
    - Использовать plainToInstance для трансформации
    - Правильная изоляция по organizationId
```

### Шаг 6: Регистрация модулей

```typescript
[ ] Добавить Visit, Prescription, LabOrder, MedicalRecord в app.module.ts
[ ] Проверить импорты и зависимости
```

### Шаг 7: Prisma Migration

```typescript
[ ] Запустить: pnpm prisma migrate dev --name add-visit-prescription-lab-order
[ ] Проверить миграцию
[ ] Обновить Prisma client
```

### Шаг 8: Тестирование

```typescript
[ ] Протестировать appointment flow:
    - Создать appointment
    - Обновить статус на IN_QUEUE
    - Создать visit
    - Проверить что appointment.status = IN_PROGRESS
    - Завершить visit
    - Проверить что appointment.status = COMPLETED
[ ] Протестировать visit flow:
    - Создать visit
    - Добавить medical records
    - Добавить prescriptions
    - Добавить lab orders
    - Завершить visit
[ ] Протестировать изоляцию по organizationId
[ ] Протестировать permissions
```

---

## VII. Важные замечания

### Multi-tenancy
- **ВСЕГДА** использовать `@InjectOrganizationId()` в DTO
- Проверять `organizationId` во всех where условиях
- SUPER_ADMIN может указать organizationId явно

### Data Transformation
- Все трансформации в DTO, сервис получает чистые данные
- Использовать `@TransformEmpty()` для optional UUID
- Использовать `@TransformDate()` для дат
- Использовать `@TransformDecimal()` для Decimal полей
- Использовать `plainToInstance()` для response

### Transactions
- Использовать `$transaction` для операций с несколькими моделями
- Особенно при обновлении связанных статусов (Appointment ↔ Visit)

### Error Handling
- Бросать правильные NestJS exceptions (NotFoundException, BadRequestException, etc.)
- Обрабатывать Prisma errors (P2025, P2002, etc.)

### Testing
- После каждого модуля тестировать CRUD
- Тестировать permissions и role-based access
- Тестировать tenant isolation
