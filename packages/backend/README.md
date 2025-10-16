# Backend Package

NestJS API для медицинской системы.

## Инструкции по миграции

1. Скопируйте все файлы вашего NestJS проекта сюда
2. Переименуйте `package.json.example` в `package.json` и адаптируйте под ваш проект
3. Убедитесь, что имя пакета - `@med-monorepo/backend`

## Команды разработки

```bash
# Из корня монорепо
pnpm --filter @med-monorepo/backend dev

# Или из этой директории
pnpm dev
```

## Структура

После миграции должна быть примерно такая структура:
```
backend/
├── src/
│   ├── modules/        # Модули приложения
│   ├── common/         # Общие файлы (guards, interceptors, etc.)
│   ├── config/         # Конфигурация
│   ├── main.ts         # Точка входа
│   └── app.module.ts   # Корневой модуль
├── test/               # Тесты
├── nest-cli.json       # NestJS CLI конфигурация
├── tsconfig.json       # TypeScript конфигурация
└── package.json        # Зависимости пакета
```
