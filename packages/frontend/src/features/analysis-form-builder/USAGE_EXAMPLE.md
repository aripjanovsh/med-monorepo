# Примеры использования Analysis Form Builder

## Пример 1: Создание шаблона анализа

```tsx
// В analysis-template/components/analysis-template-form.tsx

import { AnalysisFormEditor } from "@/features/analysis-form-builder";
import type { AnalysisTemplate } from "@/features/analysis-form-builder";

export const AnalysisTemplateForm = () => {
  const [template, setTemplate] = useState<AnalysisTemplate>({
    version: 1,
    sections: [],
  });

  const handleSave = async () => {
    await createAnalysisTemplate({
      name: "Общий анализ крови",
      parameters: JSON.stringify(template),
    });
  };

  return (
    <div>
      <AnalysisFormEditor
        template={template}
        onChange={(updatedTemplate) => {
          setTemplate(updatedTemplate);
        }}
      />

      <Button onClick={handleSave}>Сохранить шаблон</Button>
    </div>
  );
};
```

---

## Пример 2: Заполнение результатов анализа

```tsx
// В service-order/components/result-input-analysis.tsx

import { AnalysisFormInteractive } from "@/features/analysis-form-builder";
import type { SavedAnalysisData } from "@/features/analysis-form-builder";

export const ResultInputAnalysis = ({ serviceOrder }) => {
  const [resultData, setResultData] = useState<SavedAnalysisData | null>(null);

  // Шаблон из analysisTemplate.parameters
  const template = JSON.parse(serviceOrder.service.analysisTemplate.parameters);

  const handleSave = async () => {
    await updateServiceOrder(serviceOrder.id, {
      resultData: JSON.stringify(resultData),
      status: "COMPLETED",
    });
  };

  return (
    <div>
      <AnalysisFormInteractive
        template={{
          id: serviceOrder.service.analysisTemplate.id,
          name: serviceOrder.service.analysisTemplate.name,
          sections: template.sections,
        }}
        value={resultData?.filledData}
        onChange={(filledData) => {
          setResultData({
            templateId: serviceOrder.service.analysisTemplate.id,
            templateName: serviceOrder.service.analysisTemplate.name,
            templateContent: template,
            filledData,
            metadata: {
              filledAt: new Date().toISOString(),
              patientId: serviceOrder.patient.id,
              serviceOrderId: serviceOrder.id,
            },
          });
        }}
        disabled={serviceOrder.status === "COMPLETED"}
      />

      <Button onClick={handleSave} disabled={!resultData}>
        Сохранить результаты
      </Button>
    </div>
  );
};
```

---

## Пример 3: Просмотр результатов анализа

```tsx
// В service-order/components/analysis-result-view.tsx

import { AnalysisFormView } from "@/features/analysis-form-builder";
import type { SavedAnalysisData } from "@/features/analysis-form-builder";

export const AnalysisResultView = ({ serviceOrder }) => {
  // Парсим сохраненные результаты
  const savedData: SavedAnalysisData = JSON.parse(
    serviceOrder.resultData || "{}",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Результаты анализа</CardTitle>
        <CardDescription>{savedData.templateName}</CardDescription>
      </CardHeader>
      <CardContent>
        <AnalysisFormView
          data={savedData.filledData}
          patientGender={serviceOrder.patient.gender}
          patientAge={calculateAge(serviceOrder.patient.birthDate)}
        />
      </CardContent>
    </Card>
  );
};
```

---

## Пример 4: Интерактивная форма для тестирования

```tsx
// В app/cabinet/settings/analysis-templates/interactive/page.tsx

import { useState } from "react";
import {
  AnalysisFormInteractive,
  createEmptyAnalysisTemplate,
} from "@/features/analysis-form-builder";
import type {
  AnalysisTemplate,
  FilledAnalysisData,
} from "@/features/analysis-form-builder";

export default function InteractiveAnalysisPage() {
  const [template, setTemplate] = useState<AnalysisTemplate>(
    createEmptyAnalysisTemplate(),
  );
  const [resultData, setResultData] = useState<FilledAnalysisData | null>(null);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Левая часть - ввод JSON */}
      <div>
        <Textarea
          value={JSON.stringify(template, null, 2)}
          onChange={(e) => {
            try {
              setTemplate(JSON.parse(e.target.value));
            } catch (error) {
              console.error("Invalid JSON");
            }
          }}
          placeholder="Вставьте JSON шаблона"
          rows={30}
        />
      </div>

      {/* Правая часть - форма */}
      <div>
        <AnalysisFormInteractive
          template={{
            id: "test-template",
            name: "Тестовый анализ",
            sections: template.sections,
          }}
          value={resultData}
          onChange={setResultData}
        />

        {/* Результат */}
        <div className="mt-4 p-4 bg-muted rounded">
          <h3 className="font-semibold mb-2">Результат:</h3>
          <pre className="text-xs">{JSON.stringify(resultData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
```

---

## Пример 5: Копирование результатов из предыдущего анализа

```tsx
// В service-order/components/previous-analysis-selector.tsx

import { AnalysisFormView } from "@/features/analysis-form-builder";
import type { SavedAnalysisData } from "@/features/analysis-form-builder";

type Props = {
  patientId: string;
  onSelect: (data: SavedAnalysisData) => void;
};

export const PreviousAnalysisSelector = ({ patientId, onSelect }: Props) => {
  const { data: previousOrders } = useQuery({
    queryKey: ["patient-previous-analysis", patientId],
    queryFn: () => fetchPreviousAnalysis(patientId),
  });

  return (
    <div className="space-y-4">
      {previousOrders?.map((order) => {
        const savedData: SavedAnalysisData = JSON.parse(order.resultData);

        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {savedData.templateName}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(order.completedAt), "dd.MM.yyyy HH:mm")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelect(savedData)}
                >
                  Использовать
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnalysisFormView
                data={savedData.filledData}
                patientGender={order.patient.gender}
                patientAge={calculateAge(order.patient.birthDate)}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
```

---

## Пример 6: Печать результатов анализа

```tsx
// В service-order/components/analysis-print-view.tsx

import { AnalysisFormView } from "@/features/analysis-form-builder";
import type { SavedAnalysisData } from "@/features/analysis-form-builder";

export const AnalysisPrintView = ({ serviceOrder }) => {
  const savedData: SavedAnalysisData = JSON.parse(serviceOrder.resultData);
  const patient = serviceOrder.patient;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:p-8">
      {/* Шапка */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Результаты анализа</h1>
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            <strong>Пациент:</strong> {patient.fullName}
          </p>
          <p>
            <strong>Дата рождения:</strong>{" "}
            {format(new Date(patient.birthDate), "dd.MM.yyyy")}
          </p>
          <p>
            <strong>Пол:</strong> {patient.gender === "MALE" ? "М" : "Ж"}
          </p>
          <p>
            <strong>Дата анализа:</strong>{" "}
            {format(new Date(serviceOrder.completedAt), "dd.MM.yyyy HH:mm")}
          </p>
        </div>
      </div>

      {/* Результаты */}
      <AnalysisFormView
        data={savedData.filledData}
        patientGender={patient.gender}
        patientAge={calculateAge(patient.birthDate)}
      />

      {/* Кнопка печати (скрыта при печати) */}
      <div className="mt-6 print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Печать
        </Button>
      </div>
    </div>
  );
};
```

---

## Пример 7: Сравнение результатов анализов

```tsx
// В service-order/components/analysis-comparison.tsx

import { AnalysisFormView } from "@/features/analysis-form-builder";
import type { SavedAnalysisData } from "@/features/analysis-form-builder";

type Props = {
  currentOrder: ServiceOrder;
  previousOrder: ServiceOrder;
};

export const AnalysisComparison = ({ currentOrder, previousOrder }: Props) => {
  const currentData: SavedAnalysisData = JSON.parse(currentOrder.resultData);
  const previousData: SavedAnalysisData = JSON.parse(previousOrder.resultData);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Текущий анализ */}
      <Card>
        <CardHeader>
          <CardTitle>Текущий анализ</CardTitle>
          <CardDescription>
            {format(new Date(currentOrder.completedAt), "dd.MM.yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalysisFormView
            data={currentData.filledData}
            patientGender={currentOrder.patient.gender}
            patientAge={calculateAge(currentOrder.patient.birthDate)}
          />
        </CardContent>
      </Card>

      {/* Предыдущий анализ */}
      <Card>
        <CardHeader>
          <CardTitle>Предыдущий анализ</CardTitle>
          <CardDescription>
            {format(new Date(previousOrder.completedAt), "dd.MM.yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalysisFormView
            data={previousData.filledData}
            patientGender={previousOrder.patient.gender}
            patientAge={calculateAge(previousOrder.patient.birthDate)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## Структура данных в БД

### AnalysisTemplate (шаблоны)

```sql
CREATE TABLE analysis_template (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  parameters TEXT NOT NULL -- JSON: AnalysisTemplate
);
```

**Пример сохраненных данных:**

```json
{
  "id": "oak-001",
  "name": "Общий анализ крови",
  "parameters": "{\"version\":1,\"sections\":[...]}"
}
```

---

### ServiceOrder (назначения с результатами)

```sql
CREATE TABLE service_order (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  service_id TEXT,
  result_data TEXT, -- JSON: SavedAnalysisData
  status TEXT
);
```

**Пример сохраненных результатов:**

```json
{
  "templateId": "oak-001",
  "templateName": "Общий анализ крови",
  "templateContent": { "version": 1, "sections": [...] },
  "filledData": {
    "templateId": "oak-001",
    "templateName": "Общий анализ крови",
    "rows": [...]
  },
  "metadata": {
    "filledAt": "2024-11-09T12:00:00Z",
    "patientId": "patient-123",
    "serviceOrderId": "order-456"
  }
}
```

---

## Утилиты

### Создание нового параметра

```typescript
import { createNewParameter } from "@/features/analysis-form-builder";

const parameter = createNewParameter();
// → { id: "param-uuid", name: "", type: "NUMBER", isRequired: true }
```

### Создание новой секции

```typescript
import { createNewSection } from "@/features/analysis-form-builder";

const section = createNewSection();
// → { id: "section-uuid", title: "", parameters: [] }
```

### Форматирование диапазона

```typescript
import { formatReferenceRange } from "@/features/analysis-form-builder";

const formatted = formatReferenceRange(130, 170, "г/л");
// → "130 - 170 г/л"
```

### Получение применимого диапазона

```typescript
import { getApplicableRange } from "@/features/analysis-form-builder";

const range = getApplicableRange(
  {
    men: { min: 130, max: 170 },
    women: { min: 120, max: 150 },
  },
  "MALE",
  45,
);
// → { min: 130, max: 170 }
```

### Вычисление статуса

```typescript
import { getReferenceStatus } from "@/features/analysis-form-builder";

const status = getReferenceStatus(145, { min: 130, max: 170 });
// → "NORMAL"

const statusHigh = getReferenceStatus(180, { min: 130, max: 170 });
// → "HIGH"

const statusLow = getReferenceStatus(110, { min: 130, max: 170 });
// → "LOW"
```

---

## Миграция со старого формата

```typescript
import { normalizeAnalysisTemplate } from "@/features/analysis-form-builder";

// Старый формат (массив параметров)
const legacyData = [{ id: "hemoglobin", name: "Гемоглобин", type: "NUMBER" }];

// Автоматическая конвертация в новый формат
const normalized = normalizeAnalysisTemplate(legacyData);
// → { version: 1, sections: [{ id: "...", title: "Основные параметры", parameters: [...] }] }
```

---

## Отличия от form-builder

| Особенность                    | form-builder              | analysis-form-builder       |
| ------------------------------ | ------------------------- | --------------------------- |
| Назначение                     | Произвольные формы        | Результаты анализов         |
| Типы полей                     | 9 типов (text, select...) | 3 типа (NUMBER, TEXT, BOOL) |
| Референсные значения           | ❌                        | ✅                          |
| Статусы (NORMAL/HIGH/LOW)      | ❌                        | ✅                          |
| Единицы измерения              | ❌                        | ✅                          |
| Условная видимость (visibleIf) | ✅                        | ❌                          |
| Ширина полей                   | ✅                        | ❌                          |
| Использование                  | Протоколы визитов         | Лабораторные анализы        |
