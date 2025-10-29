"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

type QueueItem = {
  id: string;
  patientName: string;
  waitTime: number;
  doctorName: string;
};

export function WaitingQueue() {
  // Mock data
  const queue: QueueItem[] = [
    {
      id: "1",
      patientName: "Кузнецова Анна С.",
      waitTime: 15,
      doctorName: "Петров А.В.",
    },
    {
      id: "2",
      patientName: "Петров Олег В.",
      waitTime: 10,
      doctorName: "Козлов В.Н.",
    },
    {
      id: "3",
      patientName: "Васильева Елена А.",
      waitTime: 5,
      doctorName: "Смирнова Е.И.",
    },
    {
      id: "4",
      patientName: "Новиков Дмитрий П.",
      waitTime: 2,
      doctorName: "Петров А.В.",
    },
    {
      id: "5",
      patientName: "Морозова Ольга И.",
      waitTime: 1,
      doctorName: "Козлов В.Н.",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes < 5) return "text-green-600";
    if (minutes < 15) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {queue.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between space-x-4 rounded-lg border p-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(item.patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {item.patientName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Доктор: {item.doctorName}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getWaitTimeColor(item.waitTime)}`}>
              <Clock className="h-4 w-4" />
              <span>{item.waitTime} мин</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
