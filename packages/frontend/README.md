# Frontend Package

Next.js приложение для медицинской системы.

## Инструкции по миграции

1. Скопируйте все файлы вашего Next.js проекта сюда
2. Переименуйте `package.json.example` в `package.json` и адаптируйте под ваш проект
3. Убедитесь, что имя пакета - `@med-monorepo/frontend`

## Команды разработки

```bash
# Из корня монорепо
pnpm --filter @med-monorepo/frontend dev

# Или из этой директории
pnpm dev
```

## Структура

После миграции должна быть примерно такая структура:
```
frontend/
├── app/                # Next.js App Router (если используете)
├── pages/              # Next.js Pages Router (если используете)
├── public/             # Статические файлы
├── components/         # React компоненты
├── styles/             # Стили
├── next.config.js      # Next.js конфигурация
├── tsconfig.json       # TypeScript конфигурация
└── package.json        # Зависимости пакета
```
