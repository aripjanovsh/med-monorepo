"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";
import type {
  DialogConfig,
  DialogManagerContextValue,
  DialogProps,
} from "./dialog-manager.types";

export const DialogManagerContext =
  createContext<DialogManagerContextValue | null>(null);

type DialogManagerProviderProps = {
  children: ReactNode;
};

/**
 * Глобальный провайдер для управления всеми диалогами в приложении
 *
 * @example
 * ```tsx
 * <DialogManagerProvider>
 *   <App />
 * </DialogManagerProvider>
 * ```
 */
export const DialogManagerProvider = ({
  children,
}: DialogManagerProviderProps) => {
  const [dialogs, setDialogs] = useState<Map<string, DialogConfig>>(new Map());

  const openDialog = useCallback(
    <P,>(id: string, component: DialogConfig<P>["component"], props: P) => {
      setDialogs((prev) => {
        const next = new Map(prev);
        next.set(id, { id, component, props });
        return next;
      });
    },
    [],
  );

  const closeDialog = useCallback((id: string) => {
    setDialogs((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updateDialogProps = useCallback(<P,>(id: string, props: Partial<P>) => {
    setDialogs((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) {
        next.set(id, {
          ...existing,
          props: { ...existing.props, ...props },
        });
      }
      return next;
    });
  }, []);

  const isDialogOpen = useCallback(
    (id: string) => {
      return dialogs.has(id);
    },
    [dialogs],
  );

  return (
    <DialogManagerContext.Provider
      value={{
        dialogs,
        openDialog,
        closeDialog,
        updateDialogProps,
        isDialogOpen,
      }}
    >
      {children}
      {/* Рендерим все открытые диалоги */}
      {Array.from(dialogs.values()).map((config) => {
        const Component = config.component;
        return (
          <Component
            key={config.id}
            {...config.props}
            open={true}
            onOpenChange={(open: boolean) => {
              if (!open) {
                closeDialog(config.id);
              }
              // Вызываем оригинальный onOpenChange если он был передан
              if (typeof config.props.onOpenChange === "function") {
                config.props.onOpenChange(open);
              }
            }}
          />
        );
      })}
    </DialogManagerContext.Provider>
  );
};
