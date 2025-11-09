# Руководство по созданию JSON для Analysis Form Builder

Полное руководство по ручному созданию JSON структур для шаблонов анализов.

---

## Базовая структура

### AnalysisTemplate

```json
{
  "version": 1,
  "sections": [
    {
      "id": "unique-section-id",
      "title": "Название раздела",
      "description": "Опциональное описание",
      "parameters": [/* массив параметров */]
    }
  ]
}
```

**Поля:**
- `version` (number) - версия формата, всегда `1`
- `sections` (array) - массив секций с параметрами

---

## Структура параметра (AnalysisParameter)

```json
{
  "id": "hemoglobin",
  "name": "Гемоглобин",
  "unit": "г/л",
  "type": "NUMBER",
  "isRequired": true,
  "referenceRanges": {
    "men": { "min": 130, "max": 170 },
    "women": { "min": 120, "max": 150 },
    "children": { "min": 110, "max": 140 }
  }
}
```

**Обязательные поля:**
- `id` - уникальный идентификатор (kebab-case)
- `name` - название параметра
- `type` - тип: `"NUMBER"`, `"TEXT"`, `"BOOLEAN"`
- `isRequired` - обязательное ли поле

**Опциональные поля:**
- `unit` - единица измерения (для NUMBER)
- `referenceRanges` - референсные диапазоны (для NUMBER)

---

## Типы параметров

### NUMBER (числовой)

```json
{
  "id": "glucose",
  "name": "Глюкоза",
  "unit": "ммоль/л",
  "type": "NUMBER",
  "isRequired": true,
  "referenceRanges": {
    "default": { "min": 3.3, "max": 5.5 }
  }
}
```

### TEXT (текстовый)

```json
{
  "id": "blood-smear",
  "name": "Мазок крови",
  "type": "TEXT",
  "isRequired": false
}
```

### BOOLEAN (логический)

```json
{
  "id": "rh-factor",
  "name": "Резус-фактор",
  "type": "BOOLEAN",
  "isRequired": true
}
```

---

## Референсные диапазоны

### Стандартные группы

- `men` - мужчины
- `women` - женщины
- `children` - дети до 18 лет
- `default` - для всех (fallback)

### Структура диапазона

```json
{
  "min": 130,  // опционально
  "max": 170   // опционально
}
```

### Примеры

**Только максимум:**
```json
"referenceRanges": {
  "default": { "max": 5.1 }
}
```

**Только минимум:**
```json
"referenceRanges": {
  "default": { "min": 3.5 }
}
```

**Для разных групп:**
```json
"referenceRanges": {
  "men": { "min": 62, "max": 115 },
  "women": { "min": 53, "max": 97 },
  "children": { "min": 45, "max": 90 }
}
```

---

## Полный пример: Общий анализ крови

```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-rbc",
      "title": "Эритроциты",
      "description": "Показатели красной крови",
      "parameters": [
        {
          "id": "rbc",
          "name": "Эритроциты",
          "unit": "×10¹²/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "men": { "min": 4.0, "max": 5.5 },
            "women": { "min": 3.5, "max": 5.0 }
          }
        },
        {
          "id": "hemoglobin",
          "name": "Гемоглобин",
          "unit": "г/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "men": { "min": 130, "max": 170 },
            "women": { "min": 120, "max": 150 }
          }
        }
      ]
    },
    {
      "id": "section-wbc",
      "title": "Лейкоциты",
      "parameters": [
        {
          "id": "wbc",
          "name": "Лейкоциты",
          "unit": "×10⁹/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "default": { "min": 4.0, "max": 9.0 }
          }
        },
        {
          "id": "neutrophils",
          "name": "Нейтрофилы",
          "unit": "%",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "default": { "min": 47, "max": 72 }
          }
        }
      ]
    },
    {
      "id": "section-other",
      "title": "Дополнительно",
      "parameters": [
        {
          "id": "blood-smear",
          "name": "Мазок крови",
          "type": "TEXT",
          "isRequired": false
        }
      ]
    }
  ]
}
```

---

## Биохимический анализ крови

```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-glucose",
      "title": "Углеводы",
      "parameters": [
        {
          "id": "glucose",
          "name": "Глюкоза",
          "unit": "ммоль/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "default": { "min": 3.3, "max": 5.5 }
          }
        }
      ]
    },
    {
      "id": "section-lipids",
      "title": "Липиды",
      "parameters": [
        {
          "id": "cholesterol",
          "name": "Холестерин общий",
          "unit": "ммоль/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "default": { "min": 3.0, "max": 5.2 }
          }
        },
        {
          "id": "triglycerides",
          "name": "Триглицериды",
          "unit": "ммоль/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "default": { "max": 1.7 }
          }
        }
      ]
    },
    {
      "id": "section-liver",
      "title": "Ферменты печени",
      "parameters": [
        {
          "id": "alt",
          "name": "АЛТ",
          "unit": "Ед/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "men": { "max": 41 },
            "women": { "max": 33 }
          }
        },
        {
          "id": "ast",
          "name": "АСТ",
          "unit": "Ед/л",
          "type": "NUMBER",
          "isRequired": true,
          "referenceRanges": {
            "men": { "max": 37 },
            "women": { "max": 31 }
          }
        }
      ]
    }
  ]
}
```

---

## Структура FilledAnalysisData

```json
{
  "templateId": "oak-001",
  "templateName": "Общий анализ крови",
  "rows": [
    {
      "parameterId": "hemoglobin",
      "parameterName": "Гемоглобин",
      "value": 145,
      "unit": "г/л",
      "referenceRanges": {
        "men": { "min": 130, "max": 170 }
      }
    },
    {
      "parameterId": "blood-smear",
      "parameterName": "Мазок крови",
      "value": "Нормальная морфология"
    }
  ]
}
```

---

## Валидация

### Правила

- `version` = `1`
- `sections` - массив с ≥1 секцией
- ID должны быть уникальными
- `type` = `"NUMBER"` | `"TEXT"` | `"BOOLEAN"` (UPPERCASE)
- referenceRanges только для NUMBER

### ❌ Ошибки

```json
{
  "id": "param with spaces",  // пробелы
  "type": "number",           // lowercase
  "referenceRanges": "130-170" // неправильный формат
}
```

### ✅ Правильно

```json
{
  "id": "param-kebab-case",
  "type": "NUMBER",
  "referenceRanges": {
    "default": { "min": 130, "max": 170 }
  }
}
```

---

## Утилиты

```typescript
import {
  createEmptyAnalysisTemplate,
  createNewParameter,
  createNewSection,
  normalizeAnalysisTemplate,
} from "@/features/analysis-form-builder";

// Пустой шаблон
const template = createEmptyAnalysisTemplate();
// → { version: 1, sections: [] }

// Новый параметр
const param = createNewParameter();

// Новая секция
const section = createNewSection();

// Миграция старого формата
const normalized = normalizeAnalysisTemplate(legacyData);
```

---

## Советы

### Группировка

Используйте секции для логической группировки:
- По системам органов (эритроциты, лейкоциты)
- По типам показателей (белки, липиды)

### Порядок

Располагайте параметры:
- От общих к специфичным
- От важных к дополнительным
- По медицинским стандартам

### Единицы

- Используйте стандартные медицинские единицы
- Будьте последовательны

### Референсы

- Используйте актуальные медицинские нормы
- Всегда добавляйте `default` как fallback

---

## Статусы значений

При просмотре результатов система автоматически вычисляет:

- **NORMAL** 🟢 - в пределах нормы
- **HIGH** 🔴 - выше нормы
- **LOW** 🟡 - ниже нормы
- **UNKNOWN** ⚪ - нет референсов

### Логика выбора диапазона

1. Возраст < 18 → `children`
2. Пол = MALE → `men`
3. Пол = FEMALE → `women`
4. Fallback → `default`
5. Если нет → первый доступный
