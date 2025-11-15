/**
 * Dialog Manager - Система управления модальными окнами, sheets и диалогами
 *
 * Предоставляет централизованный способ управления всеми диалогами в приложении
 * с полной типобезопасностью и удобным API.
 *
 * @example Базовое использование
 * ```tsx
 * // 1. Оберните приложение в провайдер
 * import { DialogManagerProvider } from "@/lib/dialog-manager";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <DialogManagerProvider>
 *       {children}
 *     </DialogManagerProvider>
 *   );
 * }
 *
 * // 2. Используйте useDialog в компонентах
 * import { useDialog } from "@/lib/dialog-manager";
 * import { CreatePatientSheet } from "@/features/patients";
 *
 * const MyComponent = () => {
 *   const createPatientDialog = useDialog(CreatePatientSheet);
 *
 *   const handleCreate = () => {
 *     createPatientDialog.open({
 *       onSuccess: () => {
 *         console.log("Patient created!");
 *         createPatientDialog.close();
 *       }
 *     });
 *   };
 *
 *   return <Button onClick={handleCreate}>Create Patient</Button>;
 * };
 * ```
 */

export { DialogManagerProvider } from "./dialog-manager.context";
export { useDialog } from "./dialog-manager.hook";
export { createDialog } from "./dialog-manager.utils";
export type {
  DialogProps,
  UseDialogReturn,
  ExtractDialogProps,
} from "./dialog-manager.types";
