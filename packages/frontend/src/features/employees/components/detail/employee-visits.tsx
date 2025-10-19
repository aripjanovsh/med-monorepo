"use client";

import { EmployeeResponseDto } from "@/features/employees/employee.dto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, FileText, ExternalLink, Activity } from "lucide-react";
import { useGetVisitsQuery } from "@/features/visit";
import type { VisitResponseDto } from "@/features/visit/visit.dto";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeVisitsProps {
  employee: EmployeeResponseDto;
}

export function EmployeeVisits({ employee }: EmployeeVisitsProps) {
  const { data, isLoading } = useGetVisitsQuery(
    { employeeId: employee.id, limit: 100 },
    { skip: !employee.id }
  );
  
  const visits = data?.data || [];
  const total = data?.meta?.total || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "В процессе";
      case "COMPLETED":
        return "Завершен";
      case "CANCELLED":
        return "Отменен";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузка визитов...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего визитов</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">В процессе</p>
                <p className="text-2xl font-bold">
                  {visits.filter((v: VisitResponseDto) => v.status === "IN_PROGRESS").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Завершено</p>
                <p className="text-2xl font-bold">
                  {visits.filter((v: VisitResponseDto) => v.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Визиты врача
          </CardTitle>
          <CardDescription>
            История визитов ({total})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пациент</TableHead>
                  <TableHead>Дата визита</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit: VisitResponseDto) => {
                  const patientName = visit.patient 
                    ? `${visit.patient.firstName} ${visit.patient.lastName}`
                    : "Не указан";
                  
                  return (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {visit.patient?.firstName?.[0]}{visit.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patientName}</div>
                            {visit.patient?.patientId && (
                              <div className="text-sm text-muted-foreground">
                                #{visit.patient.patientId}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(visit.visitDate).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(visit.status)}>
                          {getStatusText(visit.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {visit.patient?.id && (
                          <Link
                            href={`/cabinet/patients/${visit.patient.id}/visit/${visit.id}`}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            Открыть
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет визитов</h3>
              <p className="text-sm text-gray-500">
                У этого врача пока нет визитов.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
