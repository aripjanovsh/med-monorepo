/**
 * Примеры использования Dialog Manager
 *
 * Этот файл содержит примеры миграции и использования системы Dialog Manager.
 * Удалите этот файл после того как изучите примеры.
 */

import { useDialog } from "./dialog-manager";
import { AppointmentFormSheet } from "@/features/appointment/components/appointment-form-sheet";
import { Button } from "@/components/ui/button";

// ============================================================================
// ПРИМЕР 1: Простое использование с AppointmentFormSheet
// ============================================================================

export const Example1_BasicUsage = () => {
  // useDialog автоматически выведет типы из компонента
  const appointmentDialog = useDialog(AppointmentFormSheet);

  const handleCreateAppointment = () => {
    // TypeScript требует все обязательные пропсы!
    appointmentDialog.open({
      mode: "create", // ✓ TypeScript знает, что это "create" | "edit"
      appointmentId: null,
      onSuccess: () => {
        console.log("Appointment created!");
        appointmentDialog.close();
      },
      // patientId опционален - можно не передавать
    });
  };

  const handleEditAppointment = (id: string) => {
    appointmentDialog.open({
      mode: "edit",
      appointmentId: id,
      onSuccess: () => {
        console.log("Appointment updated!");
        appointmentDialog.close();
      },
    });
  };

  return (
    <div>
      <Button onClick={handleCreateAppointment}>Создать запись</Button>
      <Button onClick={() => handleEditAppointment("123")}>
        Редактировать запись
      </Button>
    </div>
  );
};

// ============================================================================
// ПРИМЕР 2: Использование с предзаполненными данными
// ============================================================================

export const Example2_WithPrefilledData = () => {
  const appointmentDialog = useDialog(AppointmentFormSheet);

  const handleCreateAppointmentForPatient = (patientId: string) => {
    appointmentDialog.open({
      mode: "create",
      appointmentId: null,
      patientId, // Предзаполняем пациента
      onSuccess: () => {
        console.log("Appointment created for patient:", patientId);
        appointmentDialog.close();
      },
    });
  };

  return (
    <Button onClick={() => handleCreateAppointmentForPatient("patient-123")}>
      Создать запись для пациента
    </Button>
  );
};

// ============================================================================
// ПРИМЕР 3: Обновление пропсов на лету
// ============================================================================

export const Example3_UpdateProps = () => {
  const appointmentDialog = useDialog(AppointmentFormSheet);

  const handleOpen = () => {
    appointmentDialog.open({
      mode: "create",
      appointmentId: null,
    });
  };

  const handleSwitchToEdit = () => {
    // Обновляем пропсы уже открытого диалога
    appointmentDialog.updateProps({
      mode: "edit",
      appointmentId: "some-id",
    });
  };

  return (
    <div>
      <Button onClick={handleOpen}>Открыть</Button>
      {appointmentDialog.isOpen && (
        <Button onClick={handleSwitchToEdit}>
          Переключить в режим редактирования
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// ПРИМЕР 4: Множественные диалоги
// ============================================================================

export const Example4_MultipleDialogs = () => {
  // Можно создавать несколько экземпляров одного и того же компонента
  const createDialog = useDialog(AppointmentFormSheet);
  const editDialog = useDialog(AppointmentFormSheet);

  return (
    <div>
      <Button
        onClick={() =>
          createDialog.open({
            mode: "create",
            appointmentId: null,
          })
        }
      >
        Создать
      </Button>
      <Button
        onClick={() =>
          editDialog.open({
            mode: "edit",
            appointmentId: "123",
          })
        }
      >
        Редактировать
      </Button>
    </div>
  );
};

// ============================================================================
// ПРИМЕР 5: Использование в custom hook
// ============================================================================

const useAppointmentActions = () => {
  const appointmentDialog = useDialog(AppointmentFormSheet);

  const createAppointment = (patientId?: string) => {
    appointmentDialog.open({
      mode: "create",
      appointmentId: null,
      patientId,
      onSuccess: () => {
        // Логика после создания
        appointmentDialog.close();
      },
    });
  };

  const editAppointment = (appointmentId: string) => {
    appointmentDialog.open({
      mode: "edit",
      appointmentId,
      onSuccess: () => {
        // Логика после редактирования
        appointmentDialog.close();
      },
    });
  };

  return {
    createAppointment,
    editAppointment,
    isOpen: appointmentDialog.isOpen,
    close: appointmentDialog.close,
  };
};

export const Example5_CustomHook = () => {
  const { createAppointment, editAppointment } = useAppointmentActions();

  return (
    <div>
      <Button onClick={() => createAppointment()}>Создать</Button>
      <Button onClick={() => editAppointment("123")}>Редактировать</Button>
    </div>
  );
};
