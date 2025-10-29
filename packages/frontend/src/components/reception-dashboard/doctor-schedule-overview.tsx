"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Users } from "lucide-react";

type DoctorSchedule = {
  id: string;
  doctorName: string;
  specialty: string;
  startTime: string;
  endTime: string;
  totalAppointments: number;
  completedAppointments: number;
  currentPatient?: string;
  status: "available" | "busy" | "break" | "finished";
};

export function DoctorScheduleOverview() {
  // Mock data
  const schedules: DoctorSchedule[] = [
    {
      id: "1",
      doctorName: "Петров Александр Викторович",
      specialty: "Терапевт",
      startTime: "09:00",
      endTime: "17:00",
      totalAppointments: 12,
      completedAppointments: 5,
      currentPatient: "Сидоров И.И.",
      status: "busy",
    },
    {
      id: "2",
      doctorName: "Смирнова Елена Ивановна",
      specialty: "Кардиолог",
      startTime: "10:00",
      endTime: "18:00",
      totalAppointments: 10,
      completedAppointments: 4,
      status: "available",
    },
    {
      id: "3",
      doctorName: "Козлов Владимир Николаевич",
      specialty: "Невролог",
      startTime: "08:00",
      endTime: "16:00",
      totalAppointments: 14,
      completedAppointments: 8,
      status: "break",
    },
    {
      id: "4",
      doctorName: "Федорова Анна Сергеевна",
      specialty: "Офтальмолог",
      startTime: "09:00",
      endTime: "15:00",
      totalAppointments: 8,
      completedAppointments: 8,
      status: "finished",
    },
  ];

  const getStatusBadge = (status: DoctorSchedule["status"]) => {
    switch (status) {
      case "available":
        return <Badge variant="outline" className="bg-green-50">Свободен</Badge>;
      case "busy":
        return <Badge variant="default">На приеме</Badge>;
      case "break":
        return <Badge variant="secondary">Перерыв</Badge>;
      case "finished":
        return <Badge variant="outline">Закончил</Badge>;
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
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="rounded-lg border p-4 space-y-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{getInitials(schedule.doctorName)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {schedule.doctorName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {schedule.specialty}
                  </p>
                </div>
              </div>
              {getStatusBadge(schedule.status)}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {schedule.completedAppointments} / {schedule.totalAppointments}
                </span>
              </div>
            </div>

            {schedule.currentPatient && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Текущий пациент:{" "}
                  <span className="font-medium text-foreground">
                    {schedule.currentPatient}
                  </span>
                </p>
              </div>
            )}

            <div className="pt-2">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(schedule.completedAppointments / schedule.totalAppointments) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
