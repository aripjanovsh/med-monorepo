import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { PromptDialog, type PromptDialogOwnProps } from "./prompt-dialog";

/**
 * Хук для работы с диалогом ввода текста
 *
 * @example
 * ```tsx
 * const prompt = usePromptDialog();
 *
 * const handleCancel = () => {
 *   prompt({
 *     title: "Причина отмены",
 *     label: "Укажите причину отмены записи",
 *     multiline: true,
 *     required: true,
 *     onConfirm: async (reason) => {
 *       await cancelAppointment(id, reason);
 *       toast.success("Запись отменена");
 *     },
 *   });
 * };
 * ```
 */
export const usePromptDialog = () => {
  const dialog = useDialog(PromptDialog);

  return (props: PromptDialogOwnProps) => {
    dialog.open(props);
  };
};
