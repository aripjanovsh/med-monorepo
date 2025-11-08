# Примеры использования Form Builder

## Пример 1: Создание шаблона протокола

```tsx
// В protocol-template/components/protocol-template-form.tsx

import { FormBuilderEditor, createEmptyFormBuilderContent } from "@/features/form-builder";

export const ProtocolTemplateForm = () => {
  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(createEmptyFormBuilderContent())
  );

  return (
    <FormBuilderEditor
      initialContent={jsonContent}
      onChange={(json) => {
        setJsonContent(json);
        // Сохранить в state для отправки на сервер
      }}
    />
  );
};
```

## Пример 2: Заполнение протокола врачом

```tsx
// В visit/components/visit-protocol.tsx

import { FormBuilderInteractive } from "@/features/form-builder";
import type { FilledFormData } from "@/features/form-builder";

export const VisitProtocol = ({ visit }) => {
  const [protocolData, setProtocolData] = useState<FilledFormData>({});
  
  // Получаем шаблон из visit.protocol.content
  const templateJson = visit.protocol?.content ?? "";
  
  // Загружаем уже заполненные данные
  const initialData = visit.protocolData 
    ? JSON.parse(visit.protocolData)
    : {};

  const handleSave = async () => {
    await updateVisitProtocol(visit.id, {
      protocolData: JSON.stringify(protocolData),
    });
  };

  return (
    <div>
      <FormBuilderInteractive
        templateJson={templateJson}
        initialData={initialData}
        onChange={(data) => {
          setProtocolData(data);
          // Автосохранение каждые 3 секунды
        }}
      />
      
      <Button onClick={handleSave}>
        Сохранить протокол
      </Button>
    </div>
  );
};
```

## Пример 3: Просмотр заполненного протокола

```tsx
// В visit/components/visit-protocol-display.tsx

import { FormBuilderView } from "@/features/form-builder";

export const VisitProtocolDisplay = ({ visit }) => {
  const templateJson = visit.protocol?.content ?? "";
  const filledData = visit.protocolData 
    ? JSON.parse(visit.protocolData)
    : {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Протокол осмотра</CardTitle>
        <CardDescription>
          {visit.protocol?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormBuilderView
          templateJson={templateJson}
          data={filledData}
        />
      </CardContent>
    </Card>
  );
};
```

## Пример 4: Интерактивная форма для тестирования

```tsx
// В app/cabinet/settings/protocols/interactive/page.tsx

import { useState } from "react";
import { 
  FormBuilderInteractive, 
  deserializeFormBuilderContent 
} from "@/features/form-builder";
import type { FilledFormData } from "@/features/form-builder";

export default function InteractiveProtocolPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [formData, setFormData] = useState<FilledFormData>({});

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Левая часть - ввод JSON */}
      <div>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Вставьте JSON шаблона"
          rows={20}
        />
      </div>

      {/* Правая часть - форма */}
      <div>
        <FormBuilderInteractive
          templateJson={jsonInput}
          onChange={setFormData}
        />
        
        {/* Результат */}
        <pre className="mt-4 p-4 bg-muted rounded">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

## Пример 5: Service Order протокол (результаты анализов)

```tsx
// В service-order/components/result-input-protocol.tsx

import { FormBuilderInteractive } from "@/features/form-builder";

export const ResultInputProtocol = ({ serviceOrder }) => {
  const [resultData, setResultData] = useState({});
  
  // Шаблон берем из service.protocolTemplateId
  const template = serviceOrder.service.protocolTemplate;

  return (
    <FormBuilderInteractive
      templateJson={template.content}
      initialData={
        serviceOrder.resultData 
          ? JSON.parse(serviceOrder.resultData)
          : {}
      }
      onChange={(data) => {
        setResultData(data);
        // Автосохранение
        debouncedSave(serviceOrder.id, data);
      }}
    />
  );
};
```

## Пример 6: Компактный просмотр для списков

```tsx
// В visit/components/visit-list-item.tsx

import { FormBuilderView } from "@/features/form-builder";

export const VisitListItem = ({ visit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{visit.patient.fullName}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Компактный просмотр протокола */}
        <FormBuilderView
          templateJson={visit.protocol.content}
          data={JSON.parse(visit.protocolData || "{}")}
          compact={true} // Компактный режим без карточек
        />
      </CardContent>
    </Card>
  );
};
```

## Пример 7: Валидация перед сохранением

```tsx
import { validateFormBuilderContent, deserializeFormBuilderContent } from "@/features/form-builder";

const handleSaveTemplate = async (jsonString: string) => {
  try {
    const content = deserializeFormBuilderContent(jsonString);
    const validation = validateFormBuilderContent(content);
    
    if (!validation.valid) {
      toast.error("Ошибка валидации");
      console.error(validation.errors);
      return;
    }
    
    // Сохраняем
    await saveProtocolTemplate({
      content: jsonString,
      // ...
    });
    
    toast.success("Шаблон сохранен");
  } catch (error) {
    toast.error("Ошибка при сохранении");
  }
};
```

## Структура данных в БД

### ProtocolTemplate (шаблоны)
```sql
-- Хранится FormBuilderContent в JSON
content TEXT -- JSON string
templateType TEXT DEFAULT 'formbuilder'
```

### Visit (визиты)
```sql
-- Хранится FilledFormData в JSON
protocolData TEXT -- JSON string с заполненными данными
protocolId TEXT -- ссылка на ProtocolTemplate
```

### ServiceOrder (назначения)
```sql
-- Хранится FilledFormData в JSON
resultData TEXT -- JSON string с результатами
```

## JSON примеры

### Template (FormBuilderContent):
```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-1",
      "title": "Общие данные",
      "description": "Основная информация о пациенте",
      "fields": [
        {
          "id": "complaint",
          "type": "textarea",
          "label": "Жалобы",
          "placeholder": "Опишите жалобы пациента",
          "required": true
        },
        {
          "id": "has-allergies",
          "type": "checkbox",
          "label": "Есть аллергии",
          "defaultValue": false
        },
        {
          "id": "allergies",
          "type": "tags",
          "label": "Аллергии",
          "options": ["Пенициллин", "Аспирин", "Йод"],
          "visibleIf": {
            "fieldId": "has-allergies",
            "value": true
          }
        }
      ]
    }
  ]
}
```

### Filled Data (FilledFormData):
```json
{
  "complaint": "Головная боль, тошнота",
  "has-allergies": true,
  "allergies": ["Пенициллин", "Аспирин"]
}
```
