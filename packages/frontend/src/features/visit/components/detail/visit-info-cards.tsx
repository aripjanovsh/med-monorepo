"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { User, Stethoscope, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VisitResponseDto } from "@/features/visit/visit.dto";
import { getPatientFullName, getEmployeeFullName } from "@/features/visit";

type VisitInfoCardsProps = {
  visit: VisitResponseDto;
};

export const VisitInfoCards = ({ visit }: VisitInfoCardsProps) => {
  return (
    <>
      {/* Patient and Doctor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Пациент
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-semibold">
                {getPatientFullName(visit)}
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Дата рождения:{" "}
                  {format(new Date(visit.patient.dateOfBirth), "dd.MM.yyyy", {
                    locale: ru,
                  })}
                </p>
                <p>Пол: {visit.patient.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5" />
              Врач
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-semibold">
                {getEmployeeFullName(visit)}
              </p>
              {visit.employee.employeeId && (
                <p className="text-sm text-muted-foreground">
                  ID: {visit.employee.employeeId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Notes */}
      {visit.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Примечания к приему
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{visit.notes}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};
