import { useContext, useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { DialogManagerContext } from "./dialog-manager.context";
import type { DialogProps, UseDialogReturn, ExtractDialogProps } from "./dialog-manager.types";
import type { ComponentType } from "react";

/**
 * Хук для управления диалогом
 * Автоматически извлекает типы пропсов из компонента
 * 
 * @template TComponent - Тип компонента диалога
 * @param component - Компонент диалога, который должен иметь пропсы extends DialogProps
 * @returns Объект для управления диалогом с типобезопасным методом open
 * 
 * @example
 * ```tsx
 * // Компонент диалога
 * type MyDialogProps = DialogProps & {
 *   userId: string;
 *   onSuccess: () => void;
 * };
 * 
 * const MyDialog = ({ open, onOpenChange, userId, onSuccess }: MyDialogProps) => {
 *   // ...
 * };
 * 
 * // Использование
 * const myDialog = useDialog(MyDialog);
 * 
 * // TypeScript требует все обязательные пропсы
 * myDialog.open({
 *   userId: "123",
 *   onSuccess: () => console.log("Done!")
 * });
 * ```
 */
export const useDialog = <TComponent extends ComponentType<any>>(
  component: TComponent
): UseDialogReturn<ExtractDialogProps<TComponent>> => {
  const context = useContext(DialogManagerContext);

  if (!context) {
    throw new Error("useDialog must be used within DialogManagerProvider");
  }

  // Генерируем уникальный ID для этого экземпляра диалога
  const dialogId = useMemo(() => nanoid(), []);

  const open = useCallback(
    (props: ExtractDialogProps<TComponent>) => {
      // Объединяем пропсы пользователя с базовыми DialogProps
      const fullProps = {
        ...props,
        open: true,
        onOpenChange: (isOpen: boolean) => {
          if (!isOpen) {
            context.closeDialog(dialogId);
          }
        },
      };
      
      context.openDialog(dialogId, component, fullProps);
    },
    [context, dialogId, component]
  );

  const close = useCallback(() => {
    context.closeDialog(dialogId);
  }, [context, dialogId]);

  const updateProps = useCallback(
    (props: Partial<ExtractDialogProps<TComponent>>) => {
      context.updateDialogProps(dialogId, props);
    },
    [context, dialogId]
  );

  const isOpen = context.isDialogOpen(dialogId);

  return { open, close, isOpen, updateProps };
};
