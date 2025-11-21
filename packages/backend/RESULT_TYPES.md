# Service Order Result Types

## 📊 Типы результатов

Service Order поддерживает 3 основных типа результатов:

### 1. Text (Текстовый)

**Когда используется:**

- Простые текстовые заключения
- Описательные результаты
- Без структурированных данных

**Структура данных:**

```typescript
{
  resultText: string;
  resultData: null;
}
```

**Отображение в PDF:**

- Секция "Результаты"
- Отформатированный текстовый блок
- CSS: `.result-text`

---

### 2. Analysis (Анализы)

**Когда используется:**

- Лабораторные анализы
- Структурированные параметры с нормами
- Любые измеряемые показатели

**Структура данных:**

```typescript
{
  resultData: {
    templateId: string;
    templateName: string; // "Общий анализ крови"
    templateContent: AnalysisTemplate;
    filledData: {
      templateId: string;
      templateName: string;
      rows: [
        {
          parameterId: string;
          parameterName: string; // "Гемоглобин"
          value: string | number; // "150"
          unit: string; // "г/л"
          normalRange: string; // "130-160"
          referenceRanges: {...}
        }
      ]
    };
    metadata: {
      filledAt: string;
      patientId: string;
      serviceOrderId: string;
    }
  }
}
```

**Отображение в PDF:**

- Секция с названием шаблона
- Таблица: Показатель | Значение | Единица | Референсная норма
- Данные из `filledData.rows`

---

### 3. Protocol (Протокол)

**Когда используется:**

- Протоколы осмотров
- Заключения специалистов
- Формы с произвольными полями

**Структура данных:**

```typescript
{
  resultData: {
    templateId: string;
    templateName: string; // "Протокол УЗИ"
    templateContent: string; // JSON form-builder
    filledData: {
      [fieldName: string]: any; // "Заключение": "Норма"
    };
    metadata: {
      filledAt: string;
      patientId: string;
      visitId: string;
    }
  }
}
```

**Отображение в PDF:**

- Секция с названием шаблона
- Сетка 2 колонки (`.grid-2`)
- Label-Value пары из `filledData`

---

## 🔍 Определение типа

Backend автоматически определяет тип в `HtmlService.parseResultData()`:

```typescript
// Analysis - есть rows в filledData
if ("filledData" in data && "rows" in data.filledData) {
  return { resultType: "analysis", ... };
}

// Protocol - есть filledData но нет rows
if ("filledData" in data && !("rows" in data.filledData)) {
  return { resultType: "protocol", ... };
}

// Text - есть только resultText
if (resultText && !resultData) {
  return { resultType: "text", ... };
}
```

## 📝 Handlebars шаблон

```handlebars
<!-- Analysis -->
{{#if (eq serviceOrder.resultType "analysis")}}
  <table>
    {{#each serviceOrder.analysisData.filledData.rows}}
      <tr>
        <td>{{this.parameterName}}</td>
        <td>{{this.value}}</td>
        <td>{{this.unit}}</td>
        <td>{{this.normalRange}}</td>
      </tr>
    {{/each}}
  </table>
{{/if}}

<!-- Protocol -->
{{#if (eq serviceOrder.resultType "protocol")}}
  <div class="grid-2">
    {{#each serviceOrder.protocolData.filledData}}
      <div>
        <label>{{@key}}</label>
        <value>{{this}}</value>
      </div>
    {{/each}}
  </div>
{{/if}}

<!-- Text -->
{{#if (eq serviceOrder.resultType "text")}}
  <div class="result-text">{{serviceOrder.resultText}}</div>
{{/if}}
```

## 🔄 Миграция со старых форматов

### PatientParameters → Analysis

Старый формат с `patientParameters` отображается в legacy блоке:

```handlebars
{{#unless serviceOrder.resultType}}
  {{#if serviceOrder.patientParameters.length}}
    <table>...</table>
  {{/if}}
{{/unless}}
```

### Обратная совместимость

Frontend поддерживает старые форматы через конвертацию:

```typescript
// Старый FilledAnalysisData → новый SavedAnalysisData
if ("rows" in data && !("filledData" in data)) {
  const newData: SavedAnalysisData = {
    templateId: data.templateId,
    templateContent: { version: 1, sections: [] },
    filledData: { ...data },
    metadata: { ... }
  };
}
```

## ✅ Best Practices

1. **Всегда указывайте templateName** - он используется как заголовок секции
2. **Используйте normalRange** - для удобного отображения норм в Analysis
3. **Структурируйте filledData** - используйте понятные имена полей в Protocol
4. **Заполняйте metadata** - для трассировки данных

## 🎯 Примеры использования

### Сохранение Analysis результатов

```typescript
await serviceOrderService.update(orderId, {
  resultData: {
    templateId: "template-123",
    templateName: "Общий анализ крови",
    templateContent: analysisTemplate,
    filledData: {
      templateId: "template-123",
      templateName: "Общий анализ крови",
      rows: [
        {
          parameterId: "hb",
          parameterName: "Гемоглобин",
          value: 150,
          unit: "г/л",
          normalRange: "130-160",
        },
      ],
    },
    metadata: {
      filledAt: new Date().toISOString(),
      patientId: patient.id,
      serviceOrderId: orderId,
    },
  },
  status: OrderStatus.COMPLETED,
  resultAt: new Date(),
});
```

### Сохранение Protocol результатов

```typescript
await serviceOrderService.update(orderId, {
  resultData: {
    templateId: "protocol-456",
    templateName: "Протокол УЗИ",
    templateContent: formBuilderJSON,
    filledData: {
      "Состояние органов": "В пределах нормы",
      Заключение: "Патологии не выявлено",
      Рекомендации: "Повторный осмотр через 6 месяцев",
    },
    metadata: {
      filledAt: new Date().toISOString(),
      patientId: patient.id,
      visitId: visit.id,
    },
  },
  status: OrderStatus.COMPLETED,
  resultAt: new Date(),
});
```
