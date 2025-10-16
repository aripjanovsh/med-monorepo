# Med Monorepo

Монорепозиторий медицинского приложения с использованием Lerna и pnpm.

## Структура проекта

```
med-monorepo/
├── packages/
│   ├── frontend/      # Next.js приложение
│   └── backend/       # NestJS API
├── lerna.json
├── pnpm-workspace.yaml
└── package.json
```

## Требования

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Установка

```bash
# Установите pnpm глобально, если еще не установлен
npm install -g pnpm

# Установите зависимости
pnpm install
```

## Команды

```bash
# Запуск всех проектов в режиме разработки
pnpm dev

# Сборка всех проектов
pnpm build

# Запуск тестов
pnpm test

# Линтинг
pnpm lint

# Очистка зависимостей
pnpm clean
```

## Работа с пакетами

```bash
# Добавить зависимость в конкретный пакет
pnpm add <package> --filter <package-name>

# Например:
pnpm add axios --filter frontend
pnpm add @nestjs/common --filter backend

# Запустить команду в конкретном пакете
pnpm --filter <package-name> <command>

# Например:
pnpm --filter frontend dev
pnpm --filter backend build
```

## Миграция существующих проектов

1. Скопируйте ваш Next.js проект в `packages/frontend/`
2. Скопируйте ваш NestJS проект в `packages/backend/`
3. Убедитесь, что в каждом пакете есть корректный `package.json`
4. Запустите `pnpm install` в корне монорепо
