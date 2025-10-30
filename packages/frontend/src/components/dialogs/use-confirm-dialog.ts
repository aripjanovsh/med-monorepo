import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { ConfirmDialog, type ConfirmDialogOwnProps } from "./confirm-dialog";

/**
 * Хук для работы с диалогом подтверждения
 *
 * @example
 * ```tsx
 * const confirm = useConfirmDialog();
 *
 * const handleDelete = () => {
 *   confirm({
 *     title: "Удалить запись?",
 *     description: "Это действие нельзя отменить",
 *     variant: "destructive",
 *     onConfirm: async () => {
 *       await deleteAppointment(id);
 *       toast.success("Запись удалена");
 *     },
 *   });
 * };
 * ```
 */
export const useConfirmDialog = () => {
  const dialog = useDialog(ConfirmDialog);

  return (props: ConfirmDialogOwnProps) => {
    dialog.open(props);
  };
};
