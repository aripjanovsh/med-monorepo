"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Star,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeePerformance, EmployeeWorkload } from "@/types/dashboard";

interface EmployeePerformancePanelProps {
  performance: EmployeePerformance[];
  workload: EmployeeWorkload[];
}

export function EmployeePerformancePanel({
  performance,
  workload,
}: EmployeePerformancePanelProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-red-600";
    if (utilization >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Rankings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Top Performers
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.map((employee, index) => (
              <div
                key={employee.employeeId}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/avatars/${employee.employeeName
                          .toLowerCase()
                          .replace(" ", "")}.jpg`}
                      />
                      <AvatarFallback className="text-xs">
                        {employee.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {employee.employeeName}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="mr-1 h-3 w-3" />
                      {employee.patientsThisMonth} patients
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {employee.appointmentsThisMonth} appointments
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div
                    className={`flex items-center ${getRatingColor(
                      employee.rating
                    )}`}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    <span className="text-sm font-medium">
                      {employee.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ${employee.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Workload Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workload.map((employee) => (
              <div key={employee.employeeId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`/avatars/${employee.employeeName
                          .toLowerCase()
                          .replace(" ", "")}.jpg`}
                      />
                      <AvatarFallback className="text-xs">
                        {employee.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {employee.employeeName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">
                      Today: {employee.todayAppointments}
                    </span>
                    <span
                      className={`text-xs font-medium ${getUtilizationColor(
                        employee.utilization
                      )}`}
                    >
                      {employee.utilization}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Progress value={employee.utilization} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Week: {employee.weekAppointments} appointments</span>
                    <span>
                      {employee.utilization >= 80
                        ? "Overloaded"
                        : employee.utilization >= 60
                        ? "Busy"
                        : "Available"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">
                  {Math.round(
                    workload.reduce((sum, emp) => sum + emp.utilization, 0) /
                      workload.length
                  )}
                  %
                </p>
                <p className="text-xs text-muted-foreground">Avg Utilization</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {workload.reduce(
                    (sum, emp) => sum + emp.todayAppointments,
                    0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Today&apos;s Total
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {workload.filter((emp) => emp.utilization >= 80).length}
                </p>
                <p className="text-xs text-muted-foreground">Overloaded</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
