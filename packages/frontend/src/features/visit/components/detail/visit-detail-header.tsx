"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { VisitStatusBadge } from "@/features/visit/components/visit-status-badge";
import type { VisitStatus } from "@/features/visit/visit.constants";

type VisitDetailHeaderProps = {
  visitDate: string;
  status: VisitStatus;
  isEditable: boolean;
  onCompleteVisit: () => void;
};

export const VisitDetailHeader = ({
  visitDate,
  status,
  isEditable,
  onCompleteVisit,
}: VisitDetailHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Детали приема</h1>
          <p className="text-muted-foreground">
            {format(new Date(visitDate), "dd MMMM yyyy, HH:mm", {
              locale: ru,
            })}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <VisitStatusBadge status={status} />
        {isEditable && (
          <Button onClick={onCompleteVisit}>Завершить прием</Button>
        )}
      </div>
    </div>
  );
};
