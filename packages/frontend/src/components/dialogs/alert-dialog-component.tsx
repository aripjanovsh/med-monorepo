import type { ReactNode } from "react";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * Пропсы для AlertDialogComponent (без базовых DialogProps)
 */
export type AlertDialogComponentOwnProps = {
  title?: string;
  description?: string | ReactNode;
  buttonText?: string;
  variant?: "default" | "info" | "success" | "warning" | "error";
  onClose?: () => void;
};

/**
 * Полные пропсы с DialogProps
 */
export type AlertDialogComponentProps = AlertDialogComponentOwnProps &
  DialogProps;

/**
 * Универсальный диалог уведомления
 *
 * @example
 * ```tsx
 * const alert = useDialog(AlertDialogComponent);
 *
 * alert.open({
 *   title: "Успешно!",
 *   description: "Запись успешно создана",
 *   variant: "success",
 *   onClose: () => {
 *     alert.close();
 *   },
 * });
 * ```
 */
export const AlertDialogComponent = ({
  open,
  onOpenChange,
  title = "Уведомление",
  description,
  buttonText = "OK",
  variant = "default",
  onClose,
}: AlertDialogComponentProps) => {
  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-destructive hover:bg-destructive/90";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "info":
        return "bg-blue-600 hover:bg-blue-700";
      default:
        return "";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleClose}
            className={getVariantStyles()}
          >
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
