import type { ReactNode } from "react";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * Пропсы для ConfirmDialog (без базовых DialogProps)
 */
export type ConfirmDialogOwnProps = {
  title?: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: any;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

/**
 * Полные пропсы с DialogProps
 */
export type ConfirmDialogProps = ConfirmDialogOwnProps & DialogProps;

/**
 * Универсальный диалог подтверждения
 *
 * @example
 * ```tsx
 * const confirm = useDialog(ConfirmDialog);
 *
 * confirm.open({
 *   title: "Удалить запись?",
 *   description: "Это действие нельзя отменить",
 *   variant: "destructive",
 *   onConfirm: async () => {
 *     await deleteRecord();
 *     confirm.close();
 *   },
 * });
 * ```
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title = "Подтвердите действие",
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
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
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={buttonVariants({ variant })}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
