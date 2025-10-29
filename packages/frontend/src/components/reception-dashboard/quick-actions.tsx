"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, Calendar, ClipboardList, FileText } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: UserPlus,
      label: "Новый пациент",
      onClick: () => console.log("Register new patient"),
    },
    {
      icon: Calendar,
      label: "Записать на прием",
      onClick: () => console.log("Schedule appointment"),
    },
    {
      icon: ClipboardList,
      label: "Отметить приход",
      onClick: () => console.log("Mark arrival"),
    },
    {
      icon: FileText,
      label: "Печать документов",
      onClick: () => console.log("Print documents"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className="justify-start gap-2"
          onClick={action.onClick}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
