# Medical Clinic API

API для управления медицинскими клиниками с мультитенант архитектурой, построенный на NestJS, Prisma и PostgreSQL.

## Особенности

- 🏥 **Мультитенант архитектура** - поддержка нескольких организаций в одной базе данных
- 🔐 **JWT аутентификация** - безопасная система входа и авторизации
- 📝 **API документация** - автоматическая генерация Swagger документации
- 🗄️ **PostgreSQL** - надежная база данных с Prisma ORM
- 🐳 **Docker** - готовая конфигурация для разработки и развертывания
- ✅ **Валидация** - строгая валидация входящих данных
- 🔍 **Фильтрация по организациям** - автоматическая изоляция данных между организациями

## Технологический стек

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker, Docker Compose
- **Validation**: class-validator, class-transformer

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd medical-clinic-api
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

```bash
cp .env.example .env
```

Отредактируйте `.env` файл с вашими настройками.

### 4. Запуск базы данных

```bash
# Запуск PostgreSQL, Redis и PgAdmin
docker-compose up -d
```

### 5. Настройка базы данных

```bash
# Генерация Prisma клиента
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# (Опционально) Открыть Prisma Studio
npm run prisma:studio
```

### 6. Запуск приложения

```bash
# Режим разработки
npm run start:dev

# Режим production
npm run build
npm run start:prod
```

## API Документация

После запуска приложения, API документация доступна по адресу:
- **Swagger UI**: http://localhost:3000/api/docs

## Endpoints

### Аутентификация
- `POST /api/v1/auth/register` - Регистрация пользователя
- `POST /api/v1/auth/login` - Вход в систему
- `GET /api/v1/auth/profile` - Получение профиля пользователя
- `POST /api/v1/auth/refresh` - Обновление токена

### Организации
- `GET /api/v1/organizations` - Список организаций
- `POST /api/v1/organizations` - Создание организации
- `GET /api/v1/organizations/:id` - Получение организации по ID
- `GET /api/v1/organizations/slug/:slug` - Получение организации по slug
- `PATCH /api/v1/organizations/:id` - Обновление организации
- `DELETE /api/v1/organizations/:id` - Удаление организации

### Пользователи
- `GET /api/v1/users` - Список пользователей
- `POST /api/v1/users` - Создание пользователя
- `GET /api/v1/users/:id` - Получение пользователя по ID
- `PATCH /api/v1/users/:id` - Обновление пользователя
- `DELETE /api/v1/users/:id` - Удаление пользователя

### Сотрудники
- `GET /api/v1/employees` - Список сотрудников
- `POST /api/v1/employees` - Создание сотрудника
- `GET /api/v1/employees/:id` - Получение сотрудника по ID
- `GET /api/v1/employees/employee-id/:employeeId` - Получение по внутреннему ID
- `GET /api/v1/employees/user/:userId` - Получение сотрудника по user ID
- `PATCH /api/v1/employees/:id` - Обновление сотрудника
- `PATCH /api/v1/employees/:id/status` - Изменение статуса сотрудника
- `DELETE /api/v1/employees/:id` - Удаление сотрудника
- `GET /api/v1/employees/stats` - Статистика по сотрудникам

### Роли и разрешения
- `GET /api/v1/roles` - Список ролей
- `POST /api/v1/roles` - Создание роли
- `GET /api/v1/roles/:id` - Получение роли по ID
- `PATCH /api/v1/roles/:id` - Обновление роли
- `DELETE /api/v1/roles/:id` - Удаление роли
- `POST /api/v1/roles/:id/permissions` - Назначение разрешений роли
- `DELETE /api/v1/roles/:id/permissions` - Удаление разрешений у роли
- `POST /api/v1/roles/assign` - Назначение роли пользователю
- `DELETE /api/v1/roles/users/:userId/roles/:roleId` - Удаление роли у пользователя
- `GET /api/v1/roles/users/:userId/roles` - Роли пользователя
- `GET /api/v1/roles/users/:userId/permissions` - Разрешения пользователя

### Разрешения
- `GET /api/v1/permissions` - Список разрешений
- `POST /api/v1/permissions` - Создание разрешения
- `GET /api/v1/permissions/:id` - Получение разрешения по ID
- `PATCH /api/v1/permissions/:id` - Обновление разрешения
- `DELETE /api/v1/permissions/:id` - Удаление разрешения
- `GET /api/v1/permissions/resources` - Список ресурсов
- `GET /api/v1/permissions/grouped` - Разрешения, сгруппированные по ресурсам
- `GET /api/v1/permissions/seed` - Создание базовых разрешений

## Мультитенант архитектура

API поддерживает несколько способов определения организации (тенанта):

1. **Заголовок**: `X-Organization-Id: organization-uuid`
2. **Поддомен**: `organization.yourdomain.com`
3. **URL путь**: `/api/v1/org/organization-id/...`
4. **Query параметр**: `?organizationId=organization-uuid`

### Система ролей и разрешений

#### Базовые роли пользователей
- `SUPER_ADMIN` - Суперадминистратор (доступ ко всем организациям)
- `ADMIN` - Администратор организации
- `DOCTOR` - Врач
- `NURSE` - Медсестра
- `RECEPTIONIST` - Регистратор
- `PATIENT` - Пациент

#### Кастомные роли и разрешения
Система поддерживает гибкую настройку ролей и разрешений на уровне организации:

**Типы разрешений:**
- `CREATE` - Создание записей
- `READ` - Просмотр записей
- `UPDATE` - Обновление записей
- `DELETE` - Удаление записей
- `MANAGE` - Полный доступ (включает все действия)

**Ресурсы:**
- `users` - Пользователи
- `employees` - Сотрудники
- `patients` - Пациенты
- `doctors` - Врачи
- `appointments` - Записи на прием
- `medical_records` - Медицинские карты
- `organization` - Настройки организации
- `roles` - Роли и разрешения

**Предустановленные роли для организации:**
- **Administrator** - Полный доступ ко всем функциям
- **Doctor** - Работа с пациентами, записями и медкартами
- **Nurse** - Просмотр пациентов и записей, доступ к медкартам
- **Receptionist** - Управление пациентами и записями
- **Patient** - Ограниченный доступ к собственным записям

#### Использование Permission Guard
```typescript
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@RequirePermission({ resource: 'patients', action: 'CREATE' })
@Post()
createPatient() {
  // Только пользователи с правом создания пациентов
}
```

## База данных

Схема включает следующие основные сущности:

- **Organizations** - Организации (медклиники)
- **Users** - Пользователи системы
- **Employees** - Сотрудники организации
- **Doctors** - Врачи с профилями
- **Patients** - Пациенты
- **Appointments** - Записи на прием
- **Medical Records** - Медицинские карты
- **Departments** - Отделения
- **Services** - Медицинские услуги
- **Roles** - Кастомные роли
- **Permissions** - Разрешения системы
- **Role Assignments** - Назначения ролей пользователям

## Разработка

### Полезные команды

```bash
# Создание миграции
npx prisma migrate dev --name migration_name

# Сброс базы данных
npm run prisma:reset

# Генерация нового модуля
nest g module modules/module-name
nest g service modules/module-name
nest g controller modules/module-name

# Линтинг
npm run lint
npm run lint:fix

# Тестирование
npm run test
npm run test:e2e
npm run test:cov
```

### Структура проекта

```
src/
├── common/           # Общие компоненты
│   ├── guards/       # Guards (защитники)
│   ├── middleware/   # Middleware
│   ├── prisma/       # Prisma сервис
│   └── tenant/       # Мультитенант функциональность
├── modules/          # Бизнес модули
│   ├── auth/         # Аутентификация
│   ├── employee/     # Сотрудники
│   ├── organization/ # Организации
│   ├── role/         # Роли и разрешения
│   └── user/         # Пользователи
├── app.module.ts     # Корневой модуль
└── main.ts          # Точка входа
```

## Docker

### Разработка

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Доступные сервисы

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **PgAdmin**: http://localhost:5050 (admin@medical.com / admin123)
- **Redis**: localhost:6379

## Конфигурация

Основные переменные окружения:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

## Лицензия

Частный проект - все права защищены.
