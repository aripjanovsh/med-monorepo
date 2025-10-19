"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { useGetVisitsQuery } from "@/features/visit";
import { VisitStatusBadge } from "@/features/visit/components/visit-status-badge";
import { VisitForm } from "@/features/visit/components/visit-form";
import { getEmployeeFullName } from "@/features/visit";

type PatientVisitsProps = {
  patientId: string;
};

export const PatientVisits = ({ patientId }: PatientVisitsProps) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useGetVisitsQuery({
    patientId,
    page: 1,
    limit: 50,
  });

  const visits = data?.data || [];

  const handleViewVisit = (visitId: string) => {
    router.push(`/cabinet/patients/${patientId}/visit/${visitId}`);
  };

  const handleVisitCreated = () => {
    setIsDialogOpen(false);
    refetch();
  };

  if (isLoading) {
    return <div>Загрузка визитов...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>История визитов</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Записать на прием
          </Button>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Визитов пока нет
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Начните с записи пациента на прием
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Записать на прием
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата визита</TableHead>
                  <TableHead>Врач</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-20">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      {format(new Date(visit.visitDate), "dd.MM.yyyy HH:mm", {
                        locale: ru,
                      })}
                    </TableCell>
                    <TableCell>{getEmployeeFullName(visit)}</TableCell>
                    <TableCell>
                      <VisitStatusBadge status={visit.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVisit(visit.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Записать на прием</DialogTitle>
          </DialogHeader>
          <VisitForm
            mode="create"
            patientId={patientId}
            onSuccess={handleVisitCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
