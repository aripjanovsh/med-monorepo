"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Calendar,
  FileText,
  DollarSign,
  ClipboardList,
  Users,
} from "lucide-react";

type QuickActionsPanelProps = {
  onCreateVisit: () => void;
  onCreatePatient: () => void;
  onCreateAppointment: () => void;
  onCreateInvoice: () => void;
  onViewPatients: () => void;
  onViewReports: () => void;
};

export const QuickActionsPanel = ({
  onCreateVisit,
  onCreatePatient,
  onCreateAppointment,
  onCreateInvoice,
  onViewPatients,
  onViewReports,
}: QuickActionsPanelProps) => {
  const actions = [
    {
      icon: UserPlus,
      label: "Быстрый визит",
      description: "Создать визит без записи",
      onClick: onCreateVisit,
      variant: "default" as const,
    },
    {
      icon: Users,
      label: "Новый пациент",
      description: "Регистрация пациента",
      onClick: onCreatePatient,
      variant: "outline" as const,
    },
    {
      icon: Calendar,
      label: "Запись на приём",
      description: "Создать запись",
      onClick: onCreateAppointment,
      variant: "outline" as const,
    },
    {
      icon: DollarSign,
      label: "Выставить счёт",
      description: "Создать счёт на оплату",
      onClick: onCreateInvoice,
      variant: "outline" as const,
    },
    {
      icon: ClipboardList,
      label: "Список пациентов",
      description: "Просмотр всех пациентов",
      onClick: onViewPatients,
      variant: "outline" as const,
    },
    {
      icon: FileText,
      label: "Отчёты",
      description: "Статистика и отчёты",
      onClick: onViewReports,
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto flex-col items-start gap-1 p-4 text-left"
              onClick={action.onClick}
            >
              <div className="flex w-full items-center gap-2">
                <action.icon className="h-5 w-5" />
                <span className="font-semibold">{action.label}</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
