# Руководство по миграции проектов

## Шаги миграции

### 1. Подготовка

Убедитесь, что у вас установлен pnpm:
```bash
npm install -g pnpm
```

### 2. Миграция Frontend (Next.js)

1. Скопируйте все файлы вашего Next.js проекта в `packages/frontend/`
2. Убедитесь, что `package.json` содержит правильное имя пакета:
   ```json
   {
     "name": "@med-monorepo/frontend",
     "version": "1.0.0",
     ...
   }
   ```
3. Обновите скрипты в `package.json` если необходимо

### 3. Миграция Backend (NestJS)

1. Скопируйте все файлы вашего NestJS проекта в `packages/backend/`
2. Убедитесь, что `package.json` содержит правильное имя пакета:
   ```json
   {
     "name": "@med-monorepo/backend",
     "version": "1.0.0",
     ...
   }
   ```
3. Обновите скрипты в `package.json` если необходимо

### 4. Установка зависимостей

После копирования проектов:
```bash
# Из корневой директории монорепо
pnpm install
```

### 5. Проверка работоспособности

```bash
# Запуск frontend
pnpm --filter @med-monorepo/frontend dev

# Запуск backend
pnpm --filter @med-monorepo/backend dev

# Или запустить все вместе
pnpm dev
```

## Общие зависимости

Если у вас есть зависимости, которые используются в обоих проектах, вы можете добавить их в корневой `package.json`:

```bash
pnpm add -w <package-name>
```

## Настройка переменных окружения

Каждый пакет может иметь свой `.env` файл:
- `packages/frontend/.env.local`
- `packages/backend/.env`

## Troubleshooting

### Проблемы с зависимостями

Если возникают проблемы с зависимостями:
```bash
pnpm clean
pnpm install
```

### Конфликты портов

Убедитесь, что frontend и backend используют разные порты:
- Frontend: обычно 3000
- Backend: обычно 3001 или 4000

### Peer Dependencies

Если появляются предупреждения о peer dependencies, они будут автоматически установлены благодаря настройке `auto-install-peers=true` в `.npmrc`.
