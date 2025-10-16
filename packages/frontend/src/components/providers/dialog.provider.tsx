import React, {
  ComponentClass,
  createContext,
  createElement,
  ElementType,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';

const DialogContext = createContext<DialogContextType | undefined>(undefined);

type ModalComponent = FunctionComponent | ComponentClass | ElementType;

type ModalState = {
  id: string;
  component: ModalComponent;
  props: any;
  open: boolean;
};

type DialogContextType = {
  pushModal: (id: string, component: ModalComponent, props: any) => void;
  removeModal: (id: string) => void;
  clearModals: () => void;
  setModalOpen: (id: string, isOpen: boolean) => void;
};

const DIALOG_CLOSE_ANIMATION_TIME = 200;

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalState[]>([]);

  const pushModal = useCallback((id: string, component: ModalComponent, props: any) => {
    setModals((prev) => {
      const index = prev.findIndex((modal) => modal.id === id);
      if (index === -1) {
        return [...prev, { id, component, props, open: true }];
      }

      prev[index] = { ...prev[index], component, props, open: true };
      return [...prev];
    });
  }, []);

  const setModalOpen = useCallback((id: string, isOpen: boolean) => {
    setModals((prev) =>
      prev.map((modal) => (modal.id === id ? { ...modal, open: isOpen } : modal)),
    );
  }, []);

  const removeModal = useCallback(
    (id: string) => {
      setModals((prev) => prev.filter((modal) => modal.id !== id));
    },
    [setModals],
  );

  const clearModals = useCallback(() => {
    setModals([]);
  }, []);

  const modalContext = useMemo(
    () => ({
      pushModal,
      setModalOpen,
      clearModals,
      removeModal,
    }),
    [pushModal, setModalOpen, clearModals, removeModal],
  );

  return (
    <DialogContext.Provider value={modalContext}>
      {children}
      {modals.map(({ id, component, props, open }) =>
        createElement(component, {
          key: id,
          open,
          setOpen: (isOpen: boolean) => {
            setModalOpen(id, isOpen);
            if (!isOpen) {
              setTimeout(() => removeModal(id), DIALOG_CLOSE_ANIMATION_TIME);
            }
          },
          ...props,
        }),
      )}
    </DialogContext.Provider>
  );
};

export type ModalContentProps = {
  closeModal: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useDialog = <Props extends ModalContentProps>(
  ModalContent: React.ComponentType<Props>,
) => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog должен быть использован внутри DialogProvider');
  }

  const { pushModal, setModalOpen } = context;
  const id = useId();

  const handleCloseModal = useCallback(() => {
    setModalOpen(id, false);
  }, [id, setModalOpen]);

  const handleOpenModal = useCallback(
    (props: Omit<Props, keyof ModalContentProps>) => {
      pushModal(id, ModalContent, {
        ...props,
        closeModal: handleCloseModal,
      });
    },
    [id, pushModal, ModalContent, handleCloseModal],
  );

  return [handleOpenModal, handleCloseModal] as [
    (props: Omit<Props, keyof ModalContentProps>) => void,
    () => void,
  ];
};
