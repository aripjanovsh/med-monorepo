"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Video, MapPin } from "lucide-react";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  type: "in-person" | "online";
  status: "upcoming" | "current" | "completed";
  duration: string;
  avatar?: string;
}

export function TodaySchedule() {
  const appointments: Appointment[] = [
    {
      id: "1",
      time: "09:00",
      patient: "Елена Козлова",
      type: "in-person",
      status: "completed",
      duration: "30 мин",
    },
    {
      id: "2",
      time: "10:30",
      patient: "Дмитрий Волков",
      type: "online",
      status: "current",
      duration: "45 мин",
    },
    {
      id: "3",
      time: "12:00",
      patient: "София Андреева",
      type: "in-person",
      status: "upcoming",
      duration: "30 мин",
    },
    {
      id: "4",
      time: "14:00",
      patient: "Алексей Морозов",
      type: "in-person",
      status: "upcoming",
      duration: "60 мин",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "secondary";
      case "current":
        return "default";
      case "upcoming":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершен";
      case "current":
        return "Текущий";
      case "upcoming":
        return "Предстоящий";
      default:
        return "Неизвестно";
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            appointment.status === "current"
              ? "border-primary bg-primary/5"
              : "hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="text-sm font-mono text-muted-foreground">
              {appointment.time}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={appointment.avatar} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{appointment.patient}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {appointment.type === "online" ? (
                  <Video className="h-3 w-3" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                <span>{appointment.duration}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(appointment.status)} className="text-xs">
              {getStatusText(appointment.status)}
            </Badge>
            {appointment.status === "upcoming" && (
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Clock className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
      
      {appointments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Нет записей на сегодня
        </div>
      )}
    </div>
  );
}
