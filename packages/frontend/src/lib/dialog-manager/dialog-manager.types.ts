import type { ComponentType } from "react";

/**
 * Базовые пропсы для всех диалогов/модалок/sheets
 * Все диалоги ДОЛЖНЫ наследоваться от этого интерфейса
 */
export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Извлекает пропсы компонента без базовых DialogProps
 */
export type ExtractDialogProps<T> = T extends ComponentType<infer P>
  ? Omit<P, keyof DialogProps>
  : never;

/**
 * Конфигурация открытого диалога
 */
export type DialogConfig<P = any> = {
  id: string;
  component: ComponentType<P>;
  props: P;
};

/**
 * Контекст для управления диалогами
 */
export type DialogManagerContextValue = {
  dialogs: Map<string, DialogConfig>;
  openDialog: <P>(id: string, component: ComponentType<P>, props: P) => void;
  closeDialog: (id: string) => void;
  updateDialogProps: <P>(id: string, props: Partial<P>) => void;
  isDialogOpen: (id: string) => boolean;
};

/**
 * Возвращаемое значение хука useDialog
 */
export type UseDialogReturn<TProps> = {
  /**
   * Открыть диалог с указанными пропсами
   * Типы пропсов автоматически выводятся из компонента
   */
  open: (props: TProps) => void;
  
  /**
   * Закрыть диалог
   */
  close: () => void;
  
  /**
   * Проверить, открыт ли диалог
   */
  isOpen: boolean;
  
  /**
   * Обновить пропсы открытого диалога
   */
  updateProps: (props: Partial<TProps>) => void;
};
