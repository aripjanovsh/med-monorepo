import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import {
  AlertDialogComponent,
  type AlertDialogComponentOwnProps,
} from "./alert-dialog-component";

/**
 * Хук для работы с диалогом уведомления
 *
 * @example
 * ```tsx
 * const alert = useAlertDialog();
 *
 * const showSuccess = () => {
 *   alert({
 *     title: "Успешно!",
 *     description: "Операция выполнена успешно",
 *     variant: "success",
 *   });
 * };
 * ```
 */
export const useAlertDialog = () => {
  const dialog = useDialog(AlertDialogComponent);

  return (props: AlertDialogComponentOwnProps) => {
    dialog.open(props);
  };
};
