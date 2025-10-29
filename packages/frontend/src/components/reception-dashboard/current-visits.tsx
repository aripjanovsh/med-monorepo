"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

type VisitStatus = "waiting" | "in-progress" | "completed";

type Visit = {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  status: VisitStatus;
  arrivalTime: string;
};

export function CurrentVisits() {
  // Mock data
  const visits: Visit[] = [
    {
      id: "1",
      patientName: "Иванова Мария Петровна",
      doctorName: "Доктор Петров А.В.",
      appointmentTime: "09:00",
      status: "completed",
      arrivalTime: "08:55",
    },
    {
      id: "2",
      patientName: "Сидоров Иван Иванович",
      doctorName: "Доктор Смирнова Е.И.",
      appointmentTime: "09:30",
      status: "in-progress",
      arrivalTime: "09:25",
    },
    {
      id: "3",
      patientName: "Кузнецова Анна Сергеевна",
      doctorName: "Доктор Петров А.В.",
      appointmentTime: "10:00",
      status: "waiting",
      arrivalTime: "09:50",
    },
    {
      id: "4",
      patientName: "Петров Олег Владимирович",
      doctorName: "Доктор Козлов В.Н.",
      appointmentTime: "10:30",
      status: "waiting",
      arrivalTime: "10:25",
    },
    {
      id: "5",
      patientName: "Васильева Елена Андреевна",
      doctorName: "Доктор Смирнова Е.И.",
      appointmentTime: "11:00",
      status: "waiting",
      arrivalTime: "10:55",
    },
  ];

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50">Завершен</Badge>;
      case "in-progress":
        return <Badge variant="default">На приеме</Badge>;
      case "waiting":
        return <Badge variant="secondary">Ожидает</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{getInitials(visit.patientName)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {visit.patientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {visit.doctorName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Запись: {visit.appointmentTime}</span>
                  <span>•</span>
                  <span>Пришел: {visit.arrivalTime}</span>
                </div>
              </div>
            </div>
            <div>{getStatusBadge(visit.status)}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
