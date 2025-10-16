"use client";

import { Button } from "@/components/ui/button";
import { PrescriptionSheet } from "./prescription-sheet";
import { 
  UserPlus, 
  Calendar, 
  FileText, 
  Stethoscope, 
  MessageSquare, 
  Clock 
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: UserPlus,
      label: "Новый пациент",
      description: "Добавить пациента",
    },
    {
      icon: Calendar,
      label: "Записать на прием",
      description: "Создать запись",
    },
    {
      icon: FileText,
      label: "Создать рецепт",
      description: "Выписать лекарства",
      component: "prescription",
    },
    {
      icon: Stethoscope,
      label: "Начать осмотр",
      description: "Осмотр пациента",
    },
    {
      icon: MessageSquare,
      label: "Отправить SMS",
      description: "Уведомления",
    },
    {
      icon: Clock,
      label: "Перерыв",
      description: "Временно недоступен",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => {
        const ActionButton = (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-3 flex flex-col items-center space-y-2 hover:bg-muted"
          >
            <action.icon className="h-5 w-5" />
            <div className="text-center">
              <div className="text-xs font-medium">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.description}</div>
            </div>
          </Button>
        );

        // Wrap prescription action in PrescriptionSheet
        if (action.component === "prescription") {
          return (
            <PrescriptionSheet key={index}>
              {ActionButton}
            </PrescriptionSheet>
          );
        }

        return ActionButton;
      })}
    </div>
  );
}
