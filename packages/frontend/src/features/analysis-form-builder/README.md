# Analysis Form Builder Feature

Модуль для создания шаблонов анализов, заполнения и просмотра результатов.

## Основные возможности

- **Редактор с секциями** - создание и редактирование параметров анализа, сгруппированных по секциям
- **Интерактивное заполнение** - заполнение результатов анализа
- **Просмотр с индикаторами** - отображение результатов с вычислением статуса (норма/повышен/понижен)

## Три режима работы

### 1. Editor (Редактор шаблона)

Создание и редактирование структуры шаблона анализа с секциями.

**Input**: `AnalysisTemplate`  
**Output**: `AnalysisTemplate`

```tsx
import { AnalysisFormEditor } from "@/features/analysis-form-builder";

<AnalysisFormEditor
  template={analysisTemplate}
  onChange={(template) => {
    // Сохранить обновленный шаблон
    console.log(template);
  }}
/>
```

### 2. Interactive (Заполнение результатов)

Заполнение результатов анализа по шаблону.

**Input**: 
- `template` - шаблон анализа с параметрами
- `value` - текущие данные (FilledAnalysisData)

**Output**: `FilledAnalysisData`

```tsx
import { AnalysisFormInteractive } from "@/features/analysis-form-builder";

<AnalysisFormInteractive
  template={{
    id: "template-id",
    name: "Общий анализ крови",
    parameters: analysisParameters
  }}
  value={currentData}
  onChange={(data) => {
    // Автосохранение или отправка на сервер
    console.log(data);
  }}
  disabled={false}
/>
```

### 3. View (Просмотр результатов)

Отображение результатов анализа с вычислением статуса (read-only).

**Input**: 
- `data` - FilledAnalysisData
- `patientGender` - пол пациента (опционально)
- `patientAge` - возраст пациента (опционально)

**Output**: none (компонент для отображения)

```tsx
import { AnalysisFormView } from "@/features/analysis-form-builder";

<AnalysisFormView
  data={filledAnalysisData}
  patientGender="MALE"
  patientAge={45}
/>
```

## Типы данных

### AnalysisTemplate

Структура шаблона анализа:

```typescript
type AnalysisTemplate = {
  version: number;
  sections: AnalysisSection[];
};

type AnalysisSection = {
  id: string;
  title: string;
  description?: string;
  parameters: AnalysisParameter[];
};

type AnalysisParameter = {
  id: string;
  name: string;
  unit?: string;
  type: "NUMBER" | "TEXT" | "BOOLEAN";
  referenceRanges?: ReferenceRanges;
  isRequired: boolean;
};

type ReferenceRanges = Record<string, ReferenceRange>;

type ReferenceRange = {
  min?: number;
  max?: number;
};
```

### FilledAnalysisData

Заполненные результаты анализа:

```typescript
type FilledAnalysisData = {
  templateId: string;
  templateName: string;
  rows: AnalysisResultRow[];
};

type AnalysisResultRow = {
  parameterId: string;
  parameterName: string;
  value: string | number | boolean;
  unit?: string;
  normalRange?: string;
  referenceRanges?: ReferenceRanges;
};
```

Пример:
```json
{
  "templateId": "oak-001",
  "templateName": "Общий анализ крови",
  "rows": [
    {
      "parameterId": "hgb",
      "parameterName": "Гемоглобин",
      "value": 145,
      "unit": "г/л",
      "referenceRanges": {
        "men": { "min": 130, "max": 170 },
        "women": { "min": 120, "max": 150 }
      }
    }
  ]
}
```

## Референсные диапазоны

### Группы референсных значений

Поддерживаются стандартные группы:
- `men` - Мужчины
- `women` - Женщины
- `children` - Дети
- `default` - Общий (для всех)

Также можно добавлять кастомные группы.

### Вычисление статуса

Компонент `AnalysisFormView` автоматически:
1. Выбирает подходящий референсный диапазон на основе пола и возраста
2. Сравнивает значение с диапазоном
3. Показывает статус: `NORMAL`, `HIGH`, `LOW`, `UNKNOWN`

Логика выбора диапазона:
- Если возраст < 18 → используется `children`
- Если пол = MALE → используется `men`
- Если пол = FEMALE → используется `women`
- Fallback на `default` или первый доступный

## Пример полного flow

```tsx
import { 
  AnalysisFormEditor, 
  AnalysisFormInteractive, 
  AnalysisFormView,
  type AnalysisParameter,
  type FilledAnalysisData
} from "@/features/analysis-form-builder";

// 1. Создание шаблона (Editor)
function AnalysisTemplateForm() {
  const [parameters, setParameters] = useState<AnalysisParameter[]>([]);
  
  return (
    <AnalysisFormEditor
      parameters={parameters}
      onChange={(params) => {
        setParameters(params);
        // Сохранить в БД
      }}
    />
  );
}

// 2. Заполнение результатов (Interactive)
function ServiceOrderResultForm({ template }) {
  const [resultData, setResultData] = useState<FilledAnalysisData | null>(null);
  
  return (
    <AnalysisFormInteractive
      template={template}
      value={resultData}
      onChange={(data) => {
        setResultData(data);
        // Автосохранение
      }}
    />
  );
}

// 3. Просмотр результата (View)
function ServiceOrderResultDisplay({ data, patient }) {
  return (
    <AnalysisFormView
      data={data}
      patientGender={patient.gender}
      patientAge={patient.age}
    />
  );
}
```

## Утилиты

```typescript
import {
  createNewParameter,
  createNewSection,
  createEmptyAnalysisTemplate,
  formatReferenceRange,
  getApplicableRange,
  getReferenceStatus,
  // Миграционные утилиты
  normalizeAnalysisTemplate,
  isLegacyFormat,
} from "@/features/analysis-form-builder";

// Создать новый параметр
const param = createNewParameter();

// Создать новую секцию
const section = createNewSection();

// Создать пустой шаблон
const template = createEmptyAnalysisTemplate();
// → { version: 1, sections: [] }

// Форматировать диапазон
const range = formatReferenceRange(130, 170, "г/л");
// → "130 - 170 г/л"

// Получить подходящий диапазон
const applicable = getApplicableRange(
  { men: { min: 130, max: 170 }, women: { min: 120, max: 150 } },
  "MALE",
  45
);
// → { min: 130, max: 170 }

// Вычислить статус
const status = getReferenceStatus(145, { min: 130, max: 170 });
// → "NORMAL"

## Формат данных

Все данные хранятся в новом формате с секциями.

### Утилита нормализации

```typescript
import { normalizeAnalysisTemplate } from "@/features/analysis-form-builder";

// Нормализация данных из API
const template = normalizeAnalysisTemplate(apiData);
// Возвращает AnalysisTemplate с version и sections
```

## Структура feature

```
features/analysis-form-builder/
├── components/
│   ├── analysis-form-editor.tsx       # Режим Editor
│   ├── analysis-form-interactive.tsx  # Режим Interactive
│   ├── analysis-form-view.tsx         # Режим View
│   └── internal/                      # Внутренние компоненты
│       ├── parameters-editor-table.tsx
│       └── reference-ranges-modal.tsx
├── types/
│   └── analysis-form.types.ts         # TypeScript типы
├── constants/
│   └── analysis-form.constants.ts     # Константы
├── utils/
│   └── analysis-form.helpers.ts       # Утилиты и хелперы
├── index.ts                           # Главный экспорт
└── README.md                          # Документация
```

## Использование

### В analysis-template

```tsx
import { AnalysisFormEditor } from "@/features/analysis-form-builder";

// Используем Editor для создания/редактирования параметров анализа
```

### В service-order

```tsx
import { 
  AnalysisFormInteractive,
  AnalysisFormView 
} from "@/features/analysis-form-builder";

// Interactive - для заполнения результатов анализа
// View - для просмотра заполненных результатов
```

## Отличия от form-builder

| Характеристика | form-builder | analysis-form-builder |
|----------------|--------------|----------------------|
| Назначение | Произвольные медицинские формы | Результаты анализов |
| Структура | Секции + Поля | Параметры |
| Референсные значения | Нет | Да (по полу/возрасту) |
| Статусы значений | Нет | Да (NORMAL/HIGH/LOW) |
| Единицы измерения | Нет | Да |
| Использование | Протоколы визитов | Лабораторные анализы |

---

## Дополнительная документация

- **[JSON_GUIDE.md](./JSON_GUIDE.md)** - Полное руководство по созданию JSON структур вручную
- **[USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md)** - Примеры использования компонентов в коде
