# Быстрый старт

## ✅ Монорепо успешно инициализирован!

Структура проекта создана и готова к миграции ваших проектов.

## 📁 Текущая структура

```
med-monorepo/
├── packages/
│   ├── frontend/          # 👉 Скопируйте ваш Next.js проект сюда
│   │   ├── package.json.example
│   │   └── README.md
│   └── backend/           # 👉 Скопируйте ваш NestJS проект сюда
│       ├── package.json.example
│       └── README.md
├── lerna.json             # ✅ Конфигурация Lerna
├── pnpm-workspace.yaml    # ✅ Конфигурация pnpm workspace
├── package.json           # ✅ Корневой package.json
├── .npmrc                 # ✅ Настройки pnpm
├── .gitignore             # ✅ Git ignore файл
├── MIGRATION_GUIDE.md     # 📖 Подробное руководство по миграции
└── README.md              # 📖 Основная документация
```

## 🚀 Следующие шаги

### 1. Миграция Frontend (Next.js)

```bash
# Скопируйте ваш Next.js проект в packages/frontend/
# Убедитесь, что package.json имеет правильное имя:
# "name": "@med-monorepo/frontend"
```

### 2. Миграция Backend (NestJS)

```bash
# Скопируйте ваш NestJS проект в packages/backend/
# Убедитесь, что package.json имеет правильное имя:
# "name": "@med-monorepo/backend"
```

### 3. Установка зависимостей после миграции

```bash
pnpm install
```

### 4. Запуск проектов

```bash
# Запустить все проекты в параллельном режиме
pnpm dev

# Или запустить отдельно:
pnpm --filter @med-monorepo/frontend dev
pnpm --filter @med-monorepo/backend dev
```

## 📦 Управление зависимостями

```bash
# Добавить зависимость в frontend
pnpm add <package> --filter @med-monorepo/frontend

# Добавить зависимость в backend
pnpm add <package> --filter @med-monorepo/backend

# Добавить общую зависимость (в корень)
pnpm add -w <package>

# Добавить dev зависимость
pnpm add -D <package> --filter @med-monorepo/frontend
```

## 🔧 Полезные команды

```bash
# Сборка всех проектов
pnpm build

# Запуск тестов
pnpm test

# Линтинг
pnpm lint

# Очистка node_modules
pnpm clean

# Обновление зависимостей
pnpm update

# Проверка устаревших зависимостей
pnpm outdated
```

## ⚙️ Что уже настроено

- ✅ Lerna с поддержкой pnpm
- ✅ pnpm workspaces
- ✅ Независимое версионирование пакетов
- ✅ Conventional Commits для changelog
- ✅ Git репозиторий
- ✅ Структура папок для packages

## 📚 Дополнительная информация

- **MIGRATION_GUIDE.md** - Детальное руководство по миграции
- **README.md** - Полная документация проекта
- **packages/frontend/README.md** - Информация о frontend пакете
- **packages/backend/README.md** - Информация о backend пакете

## 🆘 Нужна помощь?

Если возникнут проблемы при миграции, обратитесь к файлу `MIGRATION_GUIDE.md` раздел "Troubleshooting".
