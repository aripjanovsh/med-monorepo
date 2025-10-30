import type { ComponentType } from "react";
import type { DialogProps } from "./dialog-manager.types";

/**
 * Вспомогательная функция для создания типобезопасного диалога
 * 
 * Используется для явного определения типа пропсов компонента.
 * Это улучшает автодополнение в IDE и помогает TypeScript лучше выводить типы.
 * 
 * @template TProps - Тип пропсов компонента (без базовых DialogProps)
 * @param component - Компонент диалога
 * @returns Тот же компонент, но с явной типизацией
 * 
 * @example
 * ```tsx
 * type MyDialogOwnProps = {
 *   userId: string;
 *   onSuccess: () => void;
 * };
 * 
 * type MyDialogProps = MyDialogOwnProps & DialogProps;
 * 
 * export const MyDialog = createDialog<MyDialogOwnProps>(
 *   ({ open, onOpenChange, userId, onSuccess }: MyDialogProps) => {
 *     return (
 *       <Sheet open={open} onOpenChange={onOpenChange}>
 *         {/* ... *\/}
 *       </Sheet>
 *     );
 *   }
 * );
 * 
 * // Теперь при использовании useDialog TypeScript точно знает типы:
 * const myDialog = useDialog(MyDialog);
 * myDialog.open({ userId: "123", onSuccess: () => {} }); // ✓ Типобезопасно
 * ```
 */
export const createDialog = <TProps extends Record<string, any> = Record<string, never>>(
  component: ComponentType<TProps & DialogProps>
) => {
  return component;
};
