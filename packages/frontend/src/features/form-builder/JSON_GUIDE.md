# Руководство по созданию JSON для Form Builder

Полное руководство по ручному созданию JSON структур для динамических форм.

---

## Базовая структура

### FormBuilderContent

Корневая структура шаблона формы:

```json
{
  "version": 1,
  "sections": [
    {
      "id": "unique-section-id",
      "title": "Заголовок секции",
      "description": "Опциональное описание секции",
      "fields": [
        // Массив полей
      ]
    }
  ]
}
```

**Поля:**
- `version` (number) - версия формата, всегда `1`
- `sections` (array) - массив секций формы

---

## Структура секции (FormSection)

```json
{
  "id": "section-1",
  "title": "Анамнез",
  "description": "История болезни и жалобы пациента",
  "fields": [
    // Поля секции
  ]
}
```

**Поля:**
- `id` (string, обязательное) - уникальный идентификатор секции
- `title` (string, обязательное) - название секции
- `description` (string, опциональное) - описание секции
- `fields` (array, обязательное) - массив полей

---

## Типы полей (FormField)

### Общие свойства

Все поля имеют следующие общие свойства:

```json
{
  "id": "field-id",
  "label": "Название поля",
  "type": "text",
  "placeholder": "Подсказка",
  "defaultValue": "Значение по умолчанию",
  "required": false,
  "readonly": false,
  "width": 100,
  "visibleIf": {
    "fieldId": "другое-поле-id",
    "value": true
  }
}
```

**Общие поля:**
- `id` (string, обязательное) - уникальный идентификатор поля
- `label` (string, обязательное) - название/метка поля
- `type` (string, обязательное) - тип поля (см. ниже)
- `placeholder` (string, опциональное) - текст подсказки
- `defaultValue` (any, опциональное) - значение по умолчанию
- `required` (boolean, опциональное) - обязательное поле
- `readonly` (boolean, опциональное) - только для чтения
- `width` (number, опциональное) - ширина в процентах (0-100)
- `visibleIf` (object, опциональное) - условие видимости поля

---

## Типы полей

### 1. Text (текстовое поле)

```json
{
  "id": "patient-complaint",
  "type": "text",
  "label": "Жалобы пациента",
  "placeholder": "Введите жалобы",
  "required": true,
  "defaultValue": ""
}
```

**Тип значения:** `string`

---

### 2. Textarea (многострочное текстовое поле)

```json
{
  "id": "medical-history",
  "type": "textarea",
  "label": "Анамнез",
  "placeholder": "Подробная история заболевания",
  "required": true,
  "defaultValue": ""
}
```

**Тип значения:** `string`

---

### 3. Number (числовое поле)

```json
{
  "id": "temperature",
  "type": "number",
  "label": "Температура тела (°C)",
  "placeholder": "36.6",
  "required": true,
  "defaultValue": 36.6
}
```

**Тип значения:** `number`

---

### 4. Select (выпадающий список)

```json
{
  "id": "blood-type",
  "type": "select",
  "label": "Группа крови",
  "placeholder": "Выберите группу крови",
  "required": true,
  "options": ["O(I)", "A(II)", "B(III)", "AB(IV)"],
  "defaultValue": ""
}
```

**Дополнительные поля:**
- `options` (array, обязательное) - список вариантов

**Тип значения:** `string` (одно из значений из `options`)

---

### 5. Radio (переключатели)

```json
{
  "id": "gender",
  "type": "radio",
  "label": "Пол",
  "required": true,
  "options": ["Мужской", "Женский"],
  "defaultValue": "Мужской"
}
```

**Дополнительные поля:**
- `options` (array, обязательное) - список вариантов

**Тип значения:** `string` (одно из значений из `options`)

---

### 6. Checkbox (флажок)

```json
{
  "id": "has-allergies",
  "type": "checkbox",
  "label": "Есть аллергии",
  "required": false,
  "defaultValue": false
}
```

**Тип значения:** `boolean`

---

### 7. Tags (множественный выбор с тегами)

```json
{
  "id": "symptoms",
  "type": "tags",
  "label": "Симптомы",
  "placeholder": "Выберите симптомы",
  "required": false,
  "options": [
    "Головная боль",
    "Температура",
    "Кашель",
    "Насморк",
    "Слабость"
  ],
  "defaultValue": []
}
```

**Дополнительные поля:**
- `options` (array, обязательное) - список доступных тегов

**Тип значения:** `string[]` (массив строк)

---

### 8. Date (поле даты)

```json
{
  "id": "symptom-start-date",
  "type": "date",
  "label": "Дата начала симптомов",
  "required": true
}
```

**Тип значения:** `string` (ISO 8601 формат: "YYYY-MM-DD")

---

## Условная видимость (visibleIf)

Поля могут быть показаны или скрыты в зависимости от значения другого поля:

```json
{
  "id": "has-allergies",
  "type": "checkbox",
  "label": "Есть аллергии",
  "defaultValue": false
},
{
  "id": "allergy-list",
  "type": "tags",
  "label": "Список аллергий",
  "options": ["Пенициллин", "Аспирин", "Йод"],
  "visibleIf": {
    "fieldId": "has-allergies",
    "value": true
  }
}
```

**Правило:** Поле `allergy-list` будет видно только если `has-allergies` равно `true`.

---

## Полные примеры

### Пример 1: Протокол первичного осмотра

```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-complaints",
      "title": "Жалобы",
      "description": "Основные жалобы пациента",
      "fields": [
        {
          "id": "chief-complaint",
          "type": "textarea",
          "label": "Основные жалобы",
          "placeholder": "Что беспокоит пациента?",
          "required": true
        },
        {
          "id": "symptom-duration",
          "type": "number",
          "label": "Длительность симптомов (дни)",
          "required": true
        }
      ]
    },
    {
      "id": "section-vitals",
      "title": "Витальные показатели",
      "fields": [
        {
          "id": "temperature",
          "type": "number",
          "label": "Температура (°C)",
          "placeholder": "36.6",
          "required": true,
          "width": 33
        },
        {
          "id": "blood-pressure-systolic",
          "type": "number",
          "label": "АД систолическое",
          "placeholder": "120",
          "required": true,
          "width": 33
        },
        {
          "id": "blood-pressure-diastolic",
          "type": "number",
          "label": "АД диастолическое",
          "placeholder": "80",
          "required": true,
          "width": 33
        },
        {
          "id": "heart-rate",
          "type": "number",
          "label": "ЧСС (уд/мин)",
          "required": true,
          "width": 50
        },
        {
          "id": "respiratory-rate",
          "type": "number",
          "label": "ЧД (вдохов/мин)",
          "required": true,
          "width": 50
        }
      ]
    },
    {
      "id": "section-examination",
      "title": "Осмотр",
      "fields": [
        {
          "id": "general-condition",
          "type": "select",
          "label": "Общее состояние",
          "required": true,
          "options": [
            "Удовлетворительное",
            "Среднее",
            "Тяжелое",
            "Крайне тяжелое"
          ]
        },
        {
          "id": "consciousness",
          "type": "select",
          "label": "Сознание",
          "required": true,
          "options": ["Ясное", "Оглушение", "Сопор", "Кома"]
        },
        {
          "id": "examination-notes",
          "type": "textarea",
          "label": "Примечания к осмотру",
          "placeholder": "Дополнительные наблюдения"
        }
      ]
    },
    {
      "id": "section-diagnosis",
      "title": "Диагноз и план",
      "fields": [
        {
          "id": "preliminary-diagnosis",
          "type": "textarea",
          "label": "Предварительный диагноз",
          "required": true
        },
        {
          "id": "treatment-plan",
          "type": "textarea",
          "label": "План лечения",
          "required": true
        },
        {
          "id": "requires-hospitalization",
          "type": "checkbox",
          "label": "Требуется госпитализация"
        },
        {
          "id": "hospitalization-reason",
          "type": "textarea",
          "label": "Причина госпитализации",
          "required": true,
          "visibleIf": {
            "fieldId": "requires-hospitalization",
            "value": true
          }
        }
      ]
    }
  ]
}
```

---

### Пример 2: Анкета пациента

```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-personal",
      "title": "Личные данные",
      "fields": [
        {
          "id": "full-name",
          "type": "text",
          "label": "ФИО",
          "required": true
        },
        {
          "id": "birth-date",
          "type": "date",
          "label": "Дата рождения",
          "required": true
        },
        {
          "id": "gender",
          "type": "radio",
          "label": "Пол",
          "required": true,
          "options": ["Мужской", "Женский"]
        },
        {
          "id": "phone",
          "type": "text",
          "label": "Телефон",
          "placeholder": "+998 90 123 45 67",
          "required": true
        }
      ]
    },
    {
      "id": "section-medical-history",
      "title": "Медицинский анамнез",
      "fields": [
        {
          "id": "chronic-diseases",
          "type": "tags",
          "label": "Хронические заболевания",
          "options": [
            "Гипертония",
            "Диабет",
            "Астма",
            "Сердечная недостаточность",
            "Другое"
          ]
        },
        {
          "id": "has-allergies",
          "type": "checkbox",
          "label": "Есть аллергии"
        },
        {
          "id": "allergies",
          "type": "tags",
          "label": "Аллергии",
          "placeholder": "Выберите аллергены",
          "options": [
            "Пенициллин",
            "Аспирин",
            "Йод",
            "Новокаин",
            "Пыльца",
            "Другое"
          ],
          "visibleIf": {
            "fieldId": "has-allergies",
            "value": true
          }
        },
        {
          "id": "previous-surgeries",
          "type": "textarea",
          "label": "Перенесенные операции",
          "placeholder": "Укажите какие операции и когда"
        }
      ]
    },
    {
      "id": "section-lifestyle",
      "title": "Образ жизни",
      "fields": [
        {
          "id": "smoking",
          "type": "radio",
          "label": "Курение",
          "required": true,
          "options": ["Не курю", "Курю", "Бросил(а)"]
        },
        {
          "id": "alcohol",
          "type": "radio",
          "label": "Употребление алкоголя",
          "required": true,
          "options": ["Не употребляю", "Редко", "Регулярно"]
        },
        {
          "id": "physical-activity",
          "type": "select",
          "label": "Физическая активность",
          "required": true,
          "options": [
            "Сидячий образ жизни",
            "Умеренная активность",
            "Высокая активность",
            "Профессиональный спорт"
          ]
        }
      ]
    }
  ]
}
```

---

### Пример 3: Протокол УЗИ

```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-general",
      "title": "Общая информация",
      "fields": [
        {
          "id": "study-type",
          "type": "select",
          "label": "Тип исследования",
          "required": true,
          "options": [
            "УЗИ органов брюшной полости",
            "УЗИ почек",
            "УЗИ щитовидной железы",
            "УЗИ сердца (ЭХО-КГ)",
            "УЗИ малого таза"
          ]
        },
        {
          "id": "equipment",
          "type": "text",
          "label": "Оборудование",
          "required": true
        }
      ]
    },
    {
      "id": "section-findings",
      "title": "Описание",
      "fields": [
        {
          "id": "organ-1",
          "type": "textarea",
          "label": "Печень",
          "placeholder": "Размеры, структура, эхогенность",
          "required": true
        },
        {
          "id": "organ-2",
          "type": "textarea",
          "label": "Желчный пузырь",
          "placeholder": "Размеры, стенки, содержимое",
          "required": true
        },
        {
          "id": "organ-3",
          "type": "textarea",
          "label": "Поджелудочная железа",
          "placeholder": "Размеры, структура, контуры",
          "required": true
        },
        {
          "id": "pathology-found",
          "type": "checkbox",
          "label": "Обнаружена патология"
        },
        {
          "id": "pathology-description",
          "type": "textarea",
          "label": "Описание патологии",
          "required": true,
          "visibleIf": {
            "fieldId": "pathology-found",
            "value": true
          }
        }
      ]
    },
    {
      "id": "section-conclusion",
      "title": "Заключение",
      "fields": [
        {
          "id": "conclusion",
          "type": "textarea",
          "label": "Заключение",
          "placeholder": "Итоговое заключение по результатам УЗИ",
          "required": true
        },
        {
          "id": "recommendations",
          "type": "textarea",
          "label": "Рекомендации",
          "placeholder": "Дополнительные исследования, консультации"
        }
      ]
    }
  ]
}
```

---

## Валидационные правила

### Обязательные поля

- `version` должна быть `1`
- `sections` должен быть массивом с хотя бы одной секцией
- Каждая секция должна иметь `id`, `title` и `fields`
- Каждое поле должно иметь `id`, `label` и `type`

### ID полей и секций

- Должны быть уникальными в пределах всей формы
- Рекомендуется использовать kebab-case: `blood-pressure-systolic`
- Не должны содержать пробелы

### Опции (options)

- Обязательны для типов: `select`, `radio`, `tags`
- Должны быть массивом строк
- Не должны быть пустыми

### Width (ширина)

- Значение от 0 до 100 (процент)
- Используется для создания multi-column layout
- По умолчанию 100%

### visibleIf (условная видимость)

- `fieldId` должен ссылаться на существующее поле
- `value` должен соответствовать типу поля
- Поле с `visibleIf` не может быть `required: true` (может привести к невозможности отправки формы)

---

## Типы данных для FilledFormData

После заполнения формы данные сохраняются в формате:

```json
{
  "field-id": "значение",
  "another-field-id": 123,
  "checkbox-field": true,
  "tags-field": ["tag1", "tag2"]
}
```

**Соответствие типов:**

| Тип поля | Тип значения | Пример |
|----------|--------------|--------|
| text | `string` | `"Головная боль"` |
| textarea | `string` | `"Длинный текст..."` |
| number | `number` | `36.6` |
| select | `string` | `"O(I)"` |
| radio | `string` | `"Мужской"` |
| checkbox | `boolean` | `true` |
| tags | `string[]` | `["Пенициллин", "Аспирин"]` |
| date | `string` | `"2024-11-09"` |

---

## Советы по созданию форм

### 1. Группировка полей

Используйте секции для логической группировки полей:
- Анамнез
- Витальные показатели
- Осмотр
- Диагноз и план

### 2. Ширина полей

Используйте `width` для компактного расположения связанных полей:
```json
{
  "id": "systolic",
  "width": 50
},
{
  "id": "diastolic",
  "width": 50
}
```

### 3. Значения по умолчанию

Устанавливайте `defaultValue` для часто используемых значений:
```json
{
  "id": "temperature",
  "type": "number",
  "defaultValue": 36.6
}
```

### 4. Условная видимость

Используйте `visibleIf` для скрытия нерелевантных полей:
- Скрывайте детали, если основное поле не заполнено
- Не делайте скрытые поля обязательными

### 5. Placeholder

Используйте placeholder для подсказок:
- Формат ввода: `"+998 90 123 45 67"`
- Примеры: `"36.6"`
- Инструкции: `"Опишите жалобы пациента"`

---

## Частые ошибки

### ❌ Неправильно

```json
{
  "version": 1,
  "sections": [
    {
      // Нет id
      "title": "Секция",
      "fields": [
        {
          "id": "field with spaces", // Пробелы в id
          "label": "Поле",
          "type": "select"
          // Нет options для select
        }
      ]
    }
  ]
}
```

### ✅ Правильно

```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-1",
      "title": "Секция",
      "fields": [
        {
          "id": "field-without-spaces",
          "label": "Поле",
          "type": "select",
          "options": ["Вариант 1", "Вариант 2"]
        }
      ]
    }
  ]
}
```

---

## Инструменты для работы с JSON

### В коде

```typescript
import {
  createEmptyFormBuilderContent,
  deserializeFormBuilderContent,
  validateFormBuilderContent,
} from "@/features/form-builder";

// Создать пустую форму
const empty = createEmptyFormBuilderContent();

// Парсинг JSON
const content = deserializeFormBuilderContent(jsonString);

// Валидация
const validation = validateFormBuilderContent(content);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### Онлайн инструменты

- [JSONLint](https://jsonlint.com/) - валидация JSON
- [JSON Editor Online](https://jsoneditoronline.org/) - визуальный редактор

---

## Миграция и обратная совместимость

Модуль поддерживает только версию 1. Будущие версии будут иметь автоматическую миграцию.

**Текущая версия:** `1`
