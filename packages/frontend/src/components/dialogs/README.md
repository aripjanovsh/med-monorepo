# Универсальные диалоги

Готовые диалоги для типичных сценариев с интеграцией Dialog Manager.

## Доступные диалоги

### 1. ConfirmDialog - Подтверждение действий

```tsx
import { useConfirmDialog } from "@/components/dialogs";

const MyComponent = () => {
  const confirm = useConfirmDialog();

  const handleDelete = () => {
    confirm({
      title: "Удалить запись?",
      description: "Это действие нельзя отменить",
      variant: "destructive",
      confirmText: "Удалить",
      cancelText: "Отмена",
      onConfirm: async () => {
        await deleteRecord();
        toast.success("Запись удалена");
      },
      onCancel: () => {
        console.log("Отменено");
      },
    });
  };

  return <Button onClick={handleDelete}>Удалить</Button>;
};
```

**Пропсы:**

- `title?: string` - заголовок (по умолчанию "Подтвердите действие")
- `description?: string | ReactNode` - описание
- `confirmText?: string` - текст кнопки подтверждения (по умолчанию "Подтвердить")
- `cancelText?: string` - текст кнопки отмены (по умолчанию "Отмена")
- `variant?: "default" | "destructive"` - вариант стиля кнопки
- `onConfirm: () => void | Promise<void>` - обработчик подтверждения
- `onCancel?: () => void` - обработчик отмены

### 2. AlertDialogComponent - Уведомления

```tsx
import { useAlertDialog } from "@/components/dialogs";

const MyComponent = () => {
  const alert = useAlertDialog();

  const showSuccess = () => {
    alert({
      title: "Успешно!",
      description: "Операция выполнена успешно",
      variant: "success",
      buttonText: "OK",
      onClose: () => {
        console.log("Закрыто");
      },
    });
  };

  return <Button onClick={showSuccess}>Показать уведомление</Button>;
};
```

**Пропсы:**

- `title?: string` - заголовок (по умолчанию "Уведомление")
- `description?: string | ReactNode` - описание
- `buttonText?: string` - текст кнопки (по умолчанию "OK")
- `variant?: "default" | "info" | "success" | "warning" | "error"` - вариант цвета
- `onClose?: () => void` - обработчик закрытия

### 3. PromptDialog - Ввод текста

```tsx
import { usePromptDialog } from "@/components/dialogs";

const MyComponent = () => {
  const prompt = usePromptDialog();

  const handleCancel = () => {
    prompt({
      title: "Причина отмены",
      description: "Укажите причину отмены записи",
      label: "Причина *",
      placeholder: "Введите причину...",
      multiline: true,
      required: true,
      defaultValue: "",
      confirmText: "Отменить",
      cancelText: "Назад",
      onConfirm: async (value) => {
        await cancelAppointment(value);
        toast.success("Запись отменена");
      },
    });
  };

  return <Button onClick={handleCancel}>Отменить запись</Button>;
};
```

**Пропсы:**

- `title?: string` - заголовок (по умолчанию "Введите значение")
- `description?: string` - описание
- `label?: string` - метка поля ввода
- `placeholder?: string` - placeholder
- `defaultValue?: string` - значение по умолчанию
- `confirmText?: string` - текст кнопки подтверждения (по умолчанию "Подтвердить")
- `cancelText?: string` - текст кнопки отмены (по умолчанию "Отмена")
- `multiline?: boolean` - многострочный ввод (Textarea)
- `required?: boolean` - обязательное поле (блокирует кнопку если пусто)
- `onConfirm: (value: string) => void | Promise<void>` - обработчик подтверждения
- `onCancel?: () => void` - обработчик отмены

## Использование с useDialog

Если вам нужен больший контроль, используйте `useDialog` напрямую:

```tsx
import { useDialog } from "@/lib/dialog-manager";
import { ConfirmDialog } from "@/components/dialogs";

const MyComponent = () => {
  const confirmDialog = useDialog(ConfirmDialog);

  const handleDelete = () => {
    confirmDialog.open({
      title: "Удалить?",
      onConfirm: async () => {
        await deleteRecord();
        confirmDialog.close();
      },
    });
  };

  // Можно проверить состояние
  console.log(confirmDialog.isOpen);

  // Можно закрыть программно
  confirmDialog.close();

  return <Button onClick={handleDelete}>Удалить</Button>;
};
```

## Замена стандартных диалогов

### Было (плохо):

```tsx
// window.confirm
if (!confirm("Удалить?")) return;
await deleteRecord();

// window.prompt
const reason = prompt("Причина:");
if (!reason) return;
await cancel(reason);

// window.alert
alert("Успешно!");
```

### Стало (хорошо):

```tsx
// Красивый диалог с типобезопасностью
confirm({
  title: "Удалить запись?",
  description: "Это действие нельзя отменить",
  variant: "destructive",
  onConfirm: async () => {
    await deleteRecord();
  },
});

// Диалог ввода с валидацией
prompt({
  title: "Причина отмены",
  multiline: true,
  required: true,
  onConfirm: async (reason) => {
    await cancel(reason);
  },
});

// Красивое уведомление
alert({
  title: "Успешно!",
  description: "Операция выполнена",
  variant: "success",
});
```

## Интеграция с Dialog Manager

Все универсальные диалоги работают через Dialog Manager:

- ✅ Автоматический рендеринг
- ✅ Управление через хуки
- ✅ Полная типобезопасность
- ✅ Поддержка async/await
- ✅ Множественные диалоги

## Примеры из проекта

Смотрите использование в `/app/cabinet/appointments/page.tsx`:

- `handleDelete` - использует `useConfirmDialog`
- `handleCancel` - использует `usePromptDialog`
