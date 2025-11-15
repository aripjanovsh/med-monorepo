/**
 * Универсальные диалоги для приложения
 *
 * Этот модуль предоставляет готовые диалоги для типичных сценариев:
 * - ConfirmDialog - подтверждение действий
 * - AlertDialogComponent - уведомления
 * - PromptDialog - ввод текста
 *
 * Все диалоги интегрированы с Dialog Manager и поддерживают типобезопасность.
 */

// Компоненты
export { ConfirmDialog } from "./confirm-dialog";
export type {
  ConfirmDialogProps,
  ConfirmDialogOwnProps,
} from "./confirm-dialog";

export { AlertDialogComponent } from "./alert-dialog-component";
export type {
  AlertDialogComponentProps,
  AlertDialogComponentOwnProps,
} from "./alert-dialog-component";

export { PromptDialog } from "./prompt-dialog";
export type { PromptDialogProps, PromptDialogOwnProps } from "./prompt-dialog";

// Хуки
export { useConfirmDialog } from "./use-confirm-dialog";
export { useAlertDialog } from "./use-alert-dialog";
export { usePromptDialog } from "./use-prompt-dialog";
