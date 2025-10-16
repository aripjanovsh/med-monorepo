"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Calendar, 
  FileText, 
  UserCheck, 
  MessageSquare,
  Pill
} from "lucide-react";

interface Activity {
  id: string;
  type: "appointment" | "prescription" | "patient_added" | "message" | "completed";
  title: string;
  description: string;
  time: string;
  patient?: string;
  avatar?: string;
}

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: "1",
      type: "completed",
      title: "Прием завершен",
      description: "Дмитрий Волков - Плановый осмотр",
      time: "5 мин назад",
      patient: "Дмитрий Волков",
    },
    {
      id: "2",
      type: "prescription",
      title: "Рецепт выписан",
      description: "Анна Иванова - Антибиотики",
      time: "15 мин назад",
      patient: "Анна Иванова",
    },
    {
      id: "3",
      type: "appointment",
      title: "Запись создана",
      description: "София Андреева на 12:00",
      time: "1 час назад",
      patient: "София Андреева",
    },
    {
      id: "4",
      type: "message",
      title: "SMS отправлено",
      description: "Напоминание о приеме",
      time: "2 часа назад",
      patient: "Петр Сидоров",
    },
    {
      id: "5",
      type: "patient_added",
      title: "Новый пациент",
      description: "Елена Козлова добавлена",
      time: "3 часа назад",
      patient: "Елена Козлова",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return Calendar;
      case "prescription":
        return Pill;
      case "patient_added":
        return User;
      case "message":
        return MessageSquare;
      case "completed":
        return UserCheck;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "completed":
        return "text-green-600";
      case "prescription":
        return "text-blue-600";
      case "appointment":
        return "text-purple-600";
      case "message":
        return "text-orange-600";
      case "patient_added":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        return (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`mt-1 ${getActivityColor(activity.type)}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {activity.description}
              </p>
            </div>
          </div>
        );
      })}
      
      {activities.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Нет недавней активности
        </div>
      )}
    </div>
  );
}
