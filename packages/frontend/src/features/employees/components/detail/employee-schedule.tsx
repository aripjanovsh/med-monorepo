"use client";

import { EmployeeResponseDto } from "@/features/employees/employee.dto";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface EmployeeScheduleProps {
  employee: EmployeeResponseDto;
}

export function EmployeeSchedule({ employee }: EmployeeScheduleProps) {
  // Mock schedule data for demonstration
  const mockSchedule = [
    {
      id: "1",
      date: "2024-01-25",
      startTime: "08:00",
      endTime: "12:00",
      type: "WORK" as const,
      location: "Main Clinic",
      description: "Morning shift - General consultations",
    },
    {
      id: "2",
      date: "2024-01-25",
      startTime: "13:00",
      endTime: "17:00",
      type: "WORK" as const,
      location: "Main Clinic",
      description: "Afternoon shift - Scheduled procedures",
    },
    {
      id: "3",
      date: "2024-01-26",
      startTime: "09:00",
      endTime: "10:00",
      type: "MEETING" as const,
      location: "Conference Room A",
      description: "Weekly team meeting",
    },
    {
      id: "4",
      date: "2024-01-26",
      startTime: "14:00",
      endTime: "16:00",
      type: "TRAINING" as const,
      location: "Training Center",
      description: "Advanced dental techniques workshop",
    },
  ];

  const schedule = employee.schedule || mockSchedule;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "WORK":
        return "bg-blue-100 text-blue-800";
      case "MEETING":
        return "bg-purple-100 text-purple-800";
      case "TRAINING":
        return "bg-green-100 text-green-800";
      case "BREAK":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WORK":
        return <Clock className="h-4 w-4" />;
      case "MEETING":
        return <Users className="h-4 w-4" />;
      case "TRAINING":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Group schedule by date
  const groupedSchedule = schedule.reduce((acc: any, item: any) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof schedule>);

  return (
    <div className="space-y-6">
      {/* Working Days Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Regular working days and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((dayName, index) => {
              const dayCode = ["S", "M", "T", "W", "T", "F", "S"][index];
              const workingDay = employee.workSchedule?.[dayCode];
              const isActive = workingDay || false;

              return (
                <div key={dayName} className="text-center">
                  <div
                    className={`p-3 rounded-lg border-2 ${
                      isActive
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {dayName.slice(0, 3)}
                    </div>
                    <div className="text-xs mt-1">
                      {isActive ? "Available" : "Off"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upcoming Schedule</h3>
        {Object.entries(groupedSchedule)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, items]) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {item.startTime} - {item.endTime}
                            </span>
                            <Badge
                              variant="secondary"
                              className={getTypeColor(item.type)}
                            >
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            {item.description}
                          </p>
                          {item.location && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              {item.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {Object.keys(groupedSchedule).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Schedule Available
            </h3>
            <p className="text-sm text-gray-500">
              No upcoming schedule items found for this employee.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
