"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User } from "lucide-react";
import { useGetDoctorQueueQuery } from "@/features/doctor/api/doctor.api";
import type { DoctorQueueVisit } from "@/features/doctor/types/doctor-queue";

type QueueWidgetProps = {
  employeeId: string;
  organizationId: string;
};

export const QueueWidget = ({ employeeId, organizationId }: QueueWidgetProps) => {
  const { data } = useGetDoctorQueueQuery(
    { employeeId, organizationId },
    { skip: !employeeId || !organizationId }
  );

  const queue = data?.waiting || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Очередь
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {queue.length} пациентов
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Очередь пуста
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {queue.map((item: DoctorQueueVisit, index: number) => (
                <div
                  key={item.id}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {item.queueNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {item.patient.lastName} {item.patient.firstName}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.waitingMinutes} мин
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
