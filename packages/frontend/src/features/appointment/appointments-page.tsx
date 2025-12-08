"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import { GlobalSearchAutocomplete } from "@/features/global-search";
import { AppointmentFormSheet } from "./components/appointment-form-sheet";

export const AppointmentsPage = () => {
  const formSheet = useDialog(AppointmentFormSheet);

  const handleCreate = () => {
    formSheet.open({
      mode: "create",
      appointmentId: null,
      onSuccess: () => {
        formSheet.close();
      },
    });
  };

  return (
    <>
      <LayoutHeader
        title="Записи на прием"
        right={
          <Button onClick={handleCreate}>
            <Plus />
            Создать запись
          </Button>
        }
      />
      <CabinetContent>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          {/* Illustration */}
          <div className="mb-8">
            <svg
              width="200"
              height="160"
              viewBox="0 0 200 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              {/* Simple illustration of people with calendar */}
              <circle
                cx="100"
                cy="60"
                r="50"
                fill="currentColor"
                fillOpacity="0.1"
              />
              <circle
                cx="70"
                cy="50"
                r="15"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <circle
                cx="130"
                cy="50"
                r="15"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <rect
                x="60"
                y="70"
                width="20"
                height="30"
                rx="4"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <rect
                x="120"
                y="70"
                width="20"
                height="30"
                rx="4"
                fill="currentColor"
                fillOpacity="0.2"
              />
              {/* Calendar icon */}
              <rect
                x="85"
                y="35"
                width="30"
                height="25"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <line
                x1="90"
                y1="35"
                x2="90"
                y2="30"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="110"
                y1="35"
                x2="110"
                y2="30"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="85"
                y1="43"
                x2="115"
                y2="43"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              {/* Small dots for calendar days */}
              <circle cx="92" cy="50" r="2" fill="currentColor" />
              <circle cx="100" cy="50" r="2" fill="currentColor" />
              <circle cx="108" cy="50" r="2" fill="currentColor" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-2">
            Поиск терапевта / клиента
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            для просмотра календаря записей
          </p>

          {/* Search Autocomplete */}
          <div className="w-full max-w-md">
            <GlobalSearchAutocomplete
              placeholder="Поиск по имени пациента, сотрудника, ID..."
              className="border rounded-lg shadow-sm"
            />
          </div>
        </div>
      </CabinetContent>
    </>
  );
};
