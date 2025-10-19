"use client";

import { PatientResponseDto } from "@/features/patients/patient.dto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Stethoscope, ExternalLink, Calendar } from "lucide-react";
import { useGetEmployeesQuery } from "@/features/employees";
import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PatientDoctorsProps {
  patient: PatientResponseDto;
}

export function PatientDoctors({ patient }: PatientDoctorsProps) {
  const { data, isLoading } = useGetEmployeesQuery(
    { patientId: patient.id, limit: 100 },
    { skip: !patient.id }
  );
  
  const doctors = data?.data || [];
  const total = data?.meta?.total || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузка врачей...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего врачей</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Активные</p>
                <p className="text-2xl font-bold">
                  {doctors.filter((d: EmployeeResponseDto) => d.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="mr-2 h-5 w-5" />
            Врачи пациента
          </CardTitle>
          <CardDescription>
            Закрепленные врачи ({total})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Врач</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor: EmployeeResponseDto) => {
                  const fullName = `${doctor.firstName} ${doctor.lastName}`;
                  
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {doctor.firstName[0]}{doctor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{fullName}</div>
                            {doctor.employeeId && (
                              <div className="text-sm text-muted-foreground">
                                #{doctor.employeeId}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doctor.title?.name || "Не указано"}
                      </TableCell>
                      <TableCell>
                        {doctor.phone || doctor.workPhone || "Не указан"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={doctor.status === "ACTIVE" ? "default" : "secondary"}
                        >
                          {doctor.status === "ACTIVE" ? "Активен" : "Неактивен"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/cabinet/employees/${doctor.id}`}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          Открыть
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет врачей</h3>
              <p className="text-sm text-gray-500">
                У этого пациента пока нет закрепленных врачей.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
