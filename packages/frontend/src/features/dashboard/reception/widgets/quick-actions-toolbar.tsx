"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus, Calendar, DollarSign, ClipboardPlus } from "lucide-react";

type QuickActionsToolbarProps = {
  onCreateVisit: () => void;
  onCreatePatient: () => void;
  onCreateAppointment: () => void;
  onCreateInvoice: () => void;
};

export const QuickActionsToolbar = ({
  onCreateVisit,
  onCreatePatient,
  onCreateAppointment,
  onCreateInvoice,
}: QuickActionsToolbarProps) => {
  const actions = [
    {
      icon: ClipboardPlus,
      label: "Быстрый визит",
      shortLabel: "Визит",
      onClick: onCreateVisit,
      variant: "default" as const,
    },
    {
      icon: UserPlus,
      label: "Новый пациент",
      shortLabel: "Пациент",
      onClick: onCreatePatient,
      variant: "outline" as const,
    },
    {
      icon: Calendar,
      label: "Запись на приём",
      shortLabel: "Запись",
      onClick: onCreateAppointment,
      variant: "outline" as const,
    },
    {
      icon: DollarSign,
      label: "Выставить счёт",
      shortLabel: "Счёт",
      onClick: onCreateInvoice,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((action, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Button
              variant={action.variant}
              size="sm"
              onClick={action.onClick}
              className="gap-1.5"
            >
              <action.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{action.shortLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{action.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
