"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  waitTime: string;
  priority: "high" | "medium" | "low";
  reason: string;
  avatar?: string;
}

export function PatientQueue() {
  const patients: Patient[] = [
    {
      id: "1",
      name: "Анна Иванова",
      waitTime: "15 мин",
      priority: "high",
      reason: "Срочная консультация",
    },
    {
      id: "2",
      name: "Петр Сидоров",
      waitTime: "8 мин",
      priority: "medium",
      reason: "Плановый осмотр",
    },
    {
      id: "3",
      name: "Мария Петрова",
      waitTime: "3 мин",
      priority: "low",
      reason: "Результаты анализов",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Срочно";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return "Средний";
    }
  };

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={patient.avatar} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{patient.name}</div>
              <div className="text-sm text-muted-foreground">
                {patient.reason}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getPriorityColor(patient.priority)}>
              {getPriorityText(patient.priority)}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {patient.waitTime}
            </div>
            <Button variant="outline" size="sm">
              Принять
            </Button>
          </div>
        </div>
      ))}
      
      {patients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Нет пациентов в очереди
        </div>
      )}
    </div>
  );
}
