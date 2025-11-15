# Form Builder Feature

Модуль для создания, заполнения и просмотра динамических медицинских форм.

## Основные возможности

- **Конструктор форм** - создание структуры форм с секциями и полями
- **Интерактивное заполнение** - заполнение форм пользователем
- **Просмотр данных** - отображение заполненных форм

## Три режима работы

### 1. Editor (Редактор)

Создание и редактирование структуры формы.

**Input**: JSON string (FormBuilderContent) или undefined  
**Output**: JSON string (FormBuilderContent)

```tsx
import { FormBuilderEditor } from "@/features/form-builder";

<FormBuilderEditor
  initialContent={jsonString}
  onChange={(jsonString) => {
    // jsonString - это FormBuilderContent в JSON формате
    console.log(jsonString);
  }}
/>;
```

### 2. Interactive (Заполнение)

Заполнение формы данными.

**Input**:

- `templateJson` - JSON string (FormBuilderContent)
- `initialData` - FilledFormData (опционально)

**Output**: FilledFormData (заполненные данные)

```tsx
import { FormBuilderInteractive } from "@/features/form-builder";

<FormBuilderInteractive
  templateJson={templateJsonFromEditor}
  initialData={{}} // начальные значения
  onChange={(data) => {
    // data - это FilledFormData с заполненными значениями
    console.log(data);
  }}
  readonly={false} // опционально
/>;
```

### 3. View (Просмотр)

Отображение заполненной формы (read-only).

**Input**:

- `templateJson` - JSON string (FormBuilderContent)
- `data` - FilledFormData

**Output**: none (компонент для отображения)

```tsx
import { FormBuilderView } from "@/features/form-builder";

<FormBuilderView
  templateJson={templateJsonFromEditor}
  data={filledDataFromInteractive}
  compact={false} // опционально, компактный вид без карточек
/>;
```

## Типы данных

### FormBuilderContent

Структура формы (output от Editor):

```typescript
type FormBuilderContent = {
  version: number;
  sections: FormSection[];
};

type FormSection = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
};

type FormField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string | boolean | string[] | number;
  required?: boolean;
  readonly?: boolean;
  width?: number; // процент ширины
  options?: string[]; // для select, radio, tags
  visibleIf?: {
    fieldId: string;
    value: unknown;
  };
};

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "tags"
  | "date";
```

### FilledFormData

Заполненные данные (output от Interactive):

```typescript
type FilledFormData = Record<string, FormFieldValue>;
type FormFieldValue = string | boolean | string[] | number | null;
```

Пример:

```json
{
  "patient-name": "Иванов Иван Иванович",
  "age": 45,
  "complaints": "Головная боль",
  "has-allergies": true,
  "allergies": ["Пенициллин", "Аспирин"]
}
```

## Пример полного flow

```tsx
import {
  FormBuilderEditor,
  FormBuilderInteractive,
  FormBuilderView,
  type FormBuilderContent,
  type FilledFormData,
} from "@/features/form-builder";

// 1. Создание шаблона (Editor)
function ProtocolTemplateEditor() {
  const [templateJson, setTemplateJson] = useState("");

  return (
    <FormBuilderEditor
      onChange={(json) => {
        setTemplateJson(json);
        // Сохранить в БД как protocol template
      }}
    />
  );
}

// 2. Заполнение данных (Interactive)
function VisitProtocolForm({ templateJson }) {
  const [filledData, setFilledData] = useState<FilledFormData>({});

  return (
    <FormBuilderInteractive
      templateJson={templateJson}
      onChange={(data) => {
        setFilledData(data);
        // Автосохранение или отправка на сервер
      }}
    />
  );
}

// 3. Просмотр результата (View)
function VisitProtocolDisplay({ templateJson, data }) {
  return <FormBuilderView templateJson={templateJson} data={data} />;
}
```

## Утилиты

```typescript
import {
  createEmptyFormBuilderContent,
  deserializeFormBuilderContent,
  serializeFormBuilderContent,
  validateFormBuilderContent,
  getInitialFormData,
} from "@/features/form-builder";

// Создать пустую форму
const empty = createEmptyFormBuilderContent();

// Парсинг JSON
const content = deserializeFormBuilderContent(jsonString);

// Сериализация в JSON
const json = serializeFormBuilderContent(content);

// Валидация
const validation = validateFormBuilderContent(content);
if (!validation.valid) {
  console.error(validation.errors);
}

// Получить начальные значения из template
const initialData = getInitialFormData(content);
```

## Структура feature

```
features/form-builder/
├── components/
│   ├── form-builder-editor.tsx       # Режим Editor
│   ├── form-builder-interactive.tsx  # Режим Interactive
│   ├── form-builder-view.tsx         # Режим View
│   └── internal/                     # Внутренние компоненты
│       ├── editor/                   # Компоненты редактора
│       ├── interactive/              # Компоненты заполнения
│       ├── view/                     # Компоненты просмотра
│       └── shared/                   # Общие компоненты
├── types/
│   └── form-builder.types.ts         # TypeScript типы
├── utils/
│   └── form-builder.helpers.ts       # Утилиты и хелперы
├── index.ts                          # Главный экспорт
└── README.md                         # Документация
```

## Использование в protocol-template

```tsx
import {
  FormBuilderEditor,
  FormBuilderInteractive,
  FormBuilderView,
} from "@/features/form-builder";

// В protocol-template используем три режима:
// 1. Editor - для создания шаблона протокола
// 2. Interactive - для заполнения протокола врачом во время визита
// 3. View - для просмотра заполненного протокола
```

---

## Дополнительная документация

- **[JSON_GUIDE.md](./JSON_GUIDE.md)** - Полное руководство по созданию JSON структур вручную
- **[USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md)** - Примеры использования компонентов в коде
