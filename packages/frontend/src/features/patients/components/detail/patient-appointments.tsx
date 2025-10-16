"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Filter,
  ChevronRight
} from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY" | "PROCEDURE";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  notes?: string;
}

interface PatientAppointmentsProps {
  patientId: string;
}

// Mock data - в реальном приложении это будет загружаться через API
const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: "2024-01-15",
    time: "09:00",
    type: "CONSULTATION",
    status: "COMPLETED",
    doctor: {
      id: "doc1",
      firstName: "Иван",
      lastName: "Петров",
      specialization: "Терапевт",
    },
    notes: "Общий осмотр, жалобы на головную боль",
  },
  {
    id: "2",
    date: "2024-01-22",
    time: "14:30",
    type: "FOLLOW_UP",
    status: "SCHEDULED",
    doctor: {
      id: "doc1",
      firstName: "Иван",
      lastName: "Петров",
      specialization: "Терапевт",
    },
    notes: "Контрольный осмотр после лечения",
  },
  {
    id: "3",
    date: "2024-01-08",
    time: "11:15",
    type: "PROCEDURE",
    status: "COMPLETED",
    doctor: {
      id: "doc2",
      firstName: "Мария",
      lastName: "Сидорова",
      specialization: "Кардиолог",
    },
    notes: "ЭКГ обследование",
  },
];

export function PatientAppointments({ patientId }: PatientAppointmentsProps) {
  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case "CONSULTATION":
        return "Консультация";
      case "FOLLOW_UP":
        return "Контрольный осмотр";
      case "EMERGENCY":
        return "Экстренный прием";
      case "PROCEDURE":
        return "Процедура";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Запланировано";
      case "COMPLETED":
        return "Завершено";
      case "CANCELLED":
        return "Отменено";
      case "NO_SHOW":
        return "Не явился";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "default" as const;
      case "COMPLETED":
        return "outline" as const;
      case "CANCELLED":
        return "destructive" as const;
      case "NO_SHOW":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "CONSULTATION":
        return "default" as const;
      case "FOLLOW_UP":
        return "secondary" as const;
      case "EMERGENCY":
        return "destructive" as const;
      case "PROCEDURE":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  // Сортируем приемы по дате (новые сверху)
  const sortedAppointments = [...mockAppointments].sort((a, b) => 
    new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
  );

  const upcomingAppointments = sortedAppointments.filter(apt => 
    apt.status === "SCHEDULED" && new Date(`${apt.date} ${apt.time}`) > new Date()
  );

  const pastAppointments = sortedAppointments.filter(apt => 
    apt.status === "COMPLETED" || new Date(`${apt.date} ${apt.time}`) <= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Приемы и процедуры</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Записать на прием
          </Button>
        </div>
      </div>

      {/* Предстоящие приемы */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Предстоящие приемы ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center text-center min-w-[60px]">
                    <div className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString("ru-RU", { 
                        day: "2-digit", 
                        month: "short" 
                      })}
                    </div>
                    <div className="font-medium">{appointment.time}</div>
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {appointment.doctor.firstName[0]}{appointment.doctor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getTypeVariant(appointment.type)}>
                        {getAppointmentTypeLabel(appointment.type)}
                      </Badge>
                      <Badge variant={getStatusVariant(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    <div className="font-medium">
                      {appointment.doctor.firstName} {appointment.doctor.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.doctor.specialization}
                    </div>
                    {appointment.notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* История приемов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            История приемов ({pastAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center text-center min-w-[60px]">
                      <div className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString("ru-RU", { 
                          day: "2-digit", 
                          month: "short" 
                        })}
                      </div>
                      <div className="font-medium">{appointment.time}</div>
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                        {appointment.doctor.firstName[0]}{appointment.doctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getTypeVariant(appointment.type)}>
                          {getAppointmentTypeLabel(appointment.type)}
                        </Badge>
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      <div className="font-medium">
                        {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.doctor.specialization}
                      </div>
                      {appointment.notes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет истории приемов</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
