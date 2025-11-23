# Dialog Manager

Централизованная система управления модальными окнами, sheets и диалогами с полной типобезопасностью.

## Возможности

- ✅ **Полная типобезопасность** - TypeScript автоматически выводит типы пропсов из компонента
- ✅ **Простой API** - открывайте диалоги программно через хуки
- ✅ **Нет бойлерплейта** - не нужен `useState` для каждого диалога
- ✅ **Множественные диалоги** - открывайте несколько диалогов одновременно
- ✅ **Обновление пропсов** - изменяйте пропсы уже открытого диалога
- ✅ **Легкая миграция** - существующие компоненты требуют минимальных изменений

## Установка

### 1. Добавьте провайдер в корень приложения

```tsx
// app/layout.tsx или app/providers.tsx
import { DialogManagerProvider } from "@/lib/dialog-manager";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DialogManagerProvider>{children}</DialogManagerProvider>
      </body>
    </html>
  );
}
```

### 2. Адаптируйте существующий компонент диалога

**До:**

```tsx
type MySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
};

export const MySheet = ({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: MySheetProps) => {
  // ...
};
```

**После:**

```tsx
import type { DialogProps } from "@/lib/dialog-manager";

// Пропсы без базовых DialogProps
type MySheetOwnProps = {
  userId: string;
  onSuccess: () => void;
};

// Полные пропсы с DialogProps
type MySheetProps = MySheetOwnProps & DialogProps;

export const MySheet = ({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: MySheetProps) => {
  // Компонент остается без изменений!
};
```

### 3. Используйте в компонентах

```tsx
import { useDialog } from "@/lib/dialog-manager";
import { MySheet } from "./my-sheet";

const MyComponent = () => {
  const mySheet = useDialog(MySheet);

  const handleOpen = () => {
    // TypeScript проверит все обязательные пропсы
    mySheet.open({
      userId: "123",
      onSuccess: () => {
        console.log("Success!");
        mySheet.close();
      },
    });
  };

  return <Button onClick={handleOpen}>Open Sheet</Button>;
};
```

## API Reference

### `useDialog<TComponent>(component)`

Хук для управления диалогом.

**Параметры:**

- `component` - Компонент диалога, который должен иметь пропсы `extends DialogProps`

**Возвращает:**

```typescript
{
  open: (props: TProps) => void;    // Открыть диалог с пропсами
  close: () => void;                // Закрыть диалог
  isOpen: boolean;                  // Открыт ли диалог
  updateProps: (props: Partial<TProps>) => void; // Обновить пропсы
}
```

### `DialogProps`

Базовый тип для всех диалогов:

```typescript
type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
```

### `createDialog<TProps>(component)`

Вспомогательная функция для явной типизации компонента (опционально).

```typescript
type MyDialogOwnProps = {
  userId: string;
};

export const MyDialog = createDialog<MyDialogOwnProps>(
  ({ open, onOpenChange, userId }) => {
    // ...
  }
);
```

## Примеры использования

### Базовое использование

```tsx
const appointmentDialog = useDialog(AppointmentFormSheet);

// Создать запись
appointmentDialog.open({
  mode: "create",
  appointmentId: null,
  onSuccess: () => {
    toast.success("Запись создана");
    appointmentDialog.close();
  },
});

// Редактировать запись
appointmentDialog.open({
  mode: "edit",
  appointmentId: "123",
  onSuccess: () => {
    toast.success("Запись обновлена");
    appointmentDialog.close();
  },
});
```

### С предзаполненными данными

```tsx
const createAppointmentForPatient = (patientId: string) => {
  appointmentDialog.open({
    mode: "create",
    appointmentId: null,
    patientId, // Предзаполняем пациента
    onSuccess: () => {
      appointmentDialog.close();
    },
  });
};
```

### Обновление пропсов на лету

```tsx
// Изменить режим уже открытого диалога
appointmentDialog.updateProps({
  mode: "edit",
  appointmentId: "new-id",
});
```

### Множественные диалоги

```tsx
// Можно открыть несколько разных диалогов одновременно
const createDialog = useDialog(AppointmentFormSheet);
const editDialog = useDialog(AppointmentFormSheet);

createDialog.open({ mode: "create", appointmentId: null });
editDialog.open({ mode: "edit", appointmentId: "123" });
```

### Custom hook для переиспользования

```tsx
const useAppointmentActions = () => {
  const dialog = useDialog(AppointmentFormSheet);

  const createAppointment = (patientId?: string) => {
    dialog.open({
      mode: "create",
      appointmentId: null,
      patientId,
      onSuccess: () => {
        refetchAppointments();
        dialog.close();
      },
    });
  };

  const editAppointment = (id: string) => {
    dialog.open({
      mode: "edit",
      appointmentId: id,
      onSuccess: () => {
        refetchAppointments();
        dialog.close();
      },
    });
  };

  return { createAppointment, editAppointment };
};

// Использование
const { createAppointment, editAppointment } = useAppointmentActions();
```

## Миграция существующих компонентов

### Было (старый способ):

```tsx
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
const [mode, setMode] = useState<"create" | "edit">("create");

return (
  <>
    <Button
      onClick={() => {
        setMode("create");
        setSelectedId(null);
        setIsOpen(true);
      }}
    >
      Создать
    </Button>

    <AppointmentFormSheet
      mode={mode}
      appointmentId={selectedId}
      open={isOpen}
      onOpenChange={setIsOpen}
      onSuccess={() => {
        refetch();
        setIsOpen(false);
      }}
    />
  </>
);
```

### Стало (с Dialog Manager):

```tsx
const appointmentDialog = useDialog(AppointmentFormSheet);

return (
  <Button
    onClick={() => {
      appointmentDialog.open({
        mode: "create",
        appointmentId: null,
        onSuccess: () => {
          refetch();
          appointmentDialog.close();
        },
      });
    }}
  >
    Создать
  </Button>
);
```

## Преимущества

1. **Меньше кода** - не нужны множественные `useState`
2. **Типобезопасность** - TypeScript проверяет все пропсы
3. **Лучший DX** - автодополнение работает идеально
4. **Переиспользование** - легко создавать custom hooks
5. **Тестируемость** - проще писать тесты без состояния компонентов
6. **Производительность** - диалоги рендерятся только когда открыты

## Архитектура

```
DialogManagerProvider (Context Provider)
  ├── Хранит Map всех открытых диалогов
  ├── Предоставляет методы открытия/закрытия
  └── Рендерит все открытые диалоги

useDialog(Component)
  ├── Генерирует уникальный ID для диалога
  ├── Возвращает функции open/close/updateProps
  └── Автоматически извлекает типы из компонента
```

## FAQ

### Q: Можно ли открыть один и тот же диалог несколько раз?

A: Да! Каждый вызов `useDialog` создает уникальный экземпляр:

```tsx
const dialog1 = useDialog(MySheet);
const dialog2 = useDialog(MySheet);

dialog1.open({
  /* ... */
});
dialog2.open({
  /* ... */
}); // Оба будут открыты
```

### Q: Как закрыть диалог при клике на backdrop?

A: Это происходит автоматически через `onOpenChange`. Когда пользователь кликает на backdrop, Sheet/Dialog вызывает `onOpenChange(false)`, и Dialog Manager автоматически закрывает диалог.

### Q: Можно ли использовать с Radix Dialog/AlertDialog?

A: Да! Любой компонент с пропсами `open` и `onOpenChange` совместим:

```tsx
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import type { DialogProps } from "@/lib/dialog-manager";

type MyAlertProps = DialogProps & {
  title: string;
  message: string;
};

export const MyAlert = ({
  open,
  onOpenChange,
  title,
  message,
}: MyAlertProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <h2>{title}</h2>
        <p>{message}</p>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Использование
const alert = useDialog(MyAlert);
alert.open({ title: "Warning", message: "Are you sure?" });
```

### Q: Как передать ref или другие специальные пропсы?

A: Передавайте их как обычные пропсы:

```tsx
type MyDialogProps = DialogProps & {
  myRef?: React.RefObject<HTMLDivElement>;
};

// Использование
const myRef = useRef<HTMLDivElement>(null);
dialog.open({ myRef });
```

### Q: Работают ли анимации открытия и закрытия диалогов?

A: Да! Dialog Manager полностью поддерживает анимации:

- **Анимация открытия**: Работает автоматически через `open={true}`
- **Анимация закрытия**: Dialog Manager устанавливает `open={false}` и ждет 300ms (стандартное время анимации shadcn/ui) перед размонтированием компонента

Это позволяет CSS transitions и animations корректно отработать при закрытии диалога.

```tsx
// Пример с кастомным временем анимации
// Если ваш диалог использует более длинную анимацию,
// вы можете настроить задержку в dialog-manager.context.tsx (по умолчанию 300ms)
```
