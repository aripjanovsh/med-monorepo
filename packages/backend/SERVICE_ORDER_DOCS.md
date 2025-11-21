# Service Order HTML & PDF

Модуль для генерации HTML и PDF документов с результатами анализов/процедур.

**Поддерживает 3 типа результатов:**

1. **text** - простой текстовый результат
2. **analysis** - структурированные анализы (таблица параметров)
3. **protocol** - протокол визита (форма с полями)

## 📄 Endpoints

### HTML просмотр

```
GET /api/v1/html/service-order/:serviceOrderId
```

Возвращает HTML страницу с результатами для просмотра в браузере.

### PDF просмотр

```
GET /api/v1/pdf/service-order/:serviceOrderId
```

Возвращает PDF файл с `Content-Disposition: inline` для просмотра в браузере.

### PDF скачивание

```
GET /api/v1/pdf/service-order/:serviceOrderId/download
```

Возвращает PDF файл с `Content-Disposition: attachment` для скачивания.

## 📋 Что включает документ

1. **Информация о клинике**
   - Название
   - Адрес, телефон, email

2. **Заголовок документа**
   - Название услуги/анализа
   - Дата создания
   - Статус (badge)

3. **Информация о пациенте**
   - ФИО
   - Дата рождения
   - Контакты (телефон, email)

4. **Информация о враче**
   - ФИО врача с титулом
   - Исполнитель (performedBy)
   - Дата выполнения

5. **Результаты (зависит от типа):**

   **a) Analysis Results (resultType: "analysis")**
   - Таблица с параметрами анализа
   - Колонки: Показатель, Значение, Единица, Референсная норма
   - Данные из `SavedAnalysisData.filledData.rows`

   **b) Protocol Results (resultType: "protocol")**
   - Сетка с полями протокола (grid-2)
   - Label-Value пары
   - Данные из `SavedProtocolData.filledData`

   **c) Text Results (resultType: "text")**
   - Отформатированный текстовый блок
   - Данные из `resultText`

   **d) Legacy PatientParameters**
   - Поддержка старых данных через `patientParameters`
   - Таблица показателей

6. **Footer**
   - Информация о клинике

## 🎨 Шрифты

- **Gilroy Semibold** - заголовки (h1, h2, h3, section-title)
- **Inter** - основной текст, таблицы, параграфы

## 📄 Page Breaks

- `.keep-together` - секция с показателями не разрывается
- `.avoid-break-before` - footer остается с контентом
- Строки таблиц (`tbody tr`) автоматически не разрываются

## 💻 Использование в коде

### Email отправка

```typescript
import { PdfService } from "@/modules/pdf/pdf.service";

@Injectable()
export class EmailService {
  constructor(private readonly pdfService: PdfService) {}

  async sendServiceOrderResults(serviceOrderId: string, email: string) {
    const { buffer, filename } =
      await this.pdfService.getServiceOrderPdfBuffer(serviceOrderId);

    await this.mailer.send({
      to: email,
      subject: "Результаты анализа",
      attachments: [
        {
          filename,
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });
  }
}
```

### Telegram бот

```typescript
const { buffer, filename } =
  await pdfService.getServiceOrderPdfBuffer(serviceOrderId);
await bot.sendDocument(chatId, buffer, { filename });
```

### Прямая генерация

```typescript
const buffer = await pdfService.generateServiceOrderPdf(serviceOrderId);
await fs.writeFile(`/results/${serviceOrderId}.pdf`, buffer);
```

## 🔧 Технические детали

### Шаблон

- **Путь**: `src/modules/html/templates/service-order.hbs`
- **Движок**: Handlebars
- **Стили**: `public/html/styles.css` (inline в PDF)

### Service Methods

**HtmlService:**

- `getServiceOrderData(serviceOrderId)` - получение данных
- `renderServiceOrder(serviceOrderId)` - рендеринг HTML

**PdfService:**

- `generateServiceOrderPdf(serviceOrderId)` - генерация PDF buffer
- `getServiceOrderPdfBuffer(serviceOrderId)` - buffer + имя файла

### Формат имени файла

```
service-order-{service-name}-{id}.pdf
```

Например: `service-order-анализ-крови-a1b2c3d4.pdf`

## 🎯 Статусы

| OrderStatus | Label       | Badge Color      |
| ----------- | ----------- | ---------------- |
| ORDERED     | Назначено   | info (blue)      |
| IN_PROGRESS | Выполняется | warning (orange) |
| COMPLETED   | Выполнено   | success (green)  |
| CANCELLED   | Отменено    | error (red)      |

## ⚙️ Настройки Puppeteer

```typescript
{
  format: 'A4',
  printBackground: true,
  margin: {
    top: '5mm',
    right: '5mm',
    bottom: '5mm',
    left: '5mm',
  },
}
```

## 📦 Production

Все то же самое, что для invoice:

- Chrome автоматически устанавливается при `pnpm install`
- Требуются системные библиотеки на Ubuntu
- Путь к шаблонам корректно работает в dist папке

## 🚀 Тестирование

```bash
# Запустите сервер
pnpm dev

# HTML просмотр
http://localhost:4000/api/v1/html/service-order/{id}

# PDF просмотр
http://localhost:4000/api/v1/pdf/service-order/{id}

# PDF скачивание
http://localhost:4000/api/v1/pdf/service-order/{id}/download
```

## ✅ Готово!

- ✅ HTML шаблон с Apple дизайном
- ✅ PDF генерация через Puppeteer
- ✅ Gilroy для заголовков, Inter для текста
- ✅ Page breaks настроены
- ✅ Endpoints для просмотра и скачивания
- ✅ Методы для программного использования
