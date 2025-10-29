"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

type Appointment = {
  id: string;
  time: string;
  patientName: string;
  doctorName: string;
  status: "scheduled" | "arrived" | "in-progress" | "completed";
};

export function TodayAppointments() {
  // Mock data - upcoming appointments
  const appointments: Appointment[] = [
    {
      id: "1",
      time: "11:30",
      patientName: "Морозова О.И.",
      doctorName: "Козлов В.Н.",
      status: "scheduled",
    },
    {
      id: "2",
      time: "12:00",
      patientName: "Лебедев С.А.",
      doctorName: "Петров А.В.",
      status: "scheduled",
    },
    {
      id: "3",
      time: "12:30",
      patientName: "Николаева Т.В.",
      doctorName: "Смирнова Е.И.",
      status: "scheduled",
    },
    {
      id: "4",
      time: "13:00",
      patientName: "Григорьев П.М.",
      doctorName: "Федорова А.С.",
      status: "scheduled",
    },
    {
      id: "5",
      time: "13:30",
      patientName: "Захарова Е.Д.",
      doctorName: "Козлов В.Н.",
      status: "scheduled",
    },
  ];

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Запланирован</Badge>;
      case "arrived":
        return <Badge variant="secondary">Пришел</Badge>;
      case "in-progress":
        return <Badge variant="default">На приеме</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50">Завершен</Badge>;
    }
  };

  return (
    <ScrollArea className="h-[250px] pr-4">
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-lg border p-3 hover:bg-accent transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.time}</span>
              </div>
              {getStatusBadge(appointment.status)}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{appointment.patientName}</span>
              </div>
              <p className="text-xs text-muted-foreground pl-5">
                Доктор: {appointment.doctorName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
