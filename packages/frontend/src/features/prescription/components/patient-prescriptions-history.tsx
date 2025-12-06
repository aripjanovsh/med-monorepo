"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Pill, Eye, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useGetPrescriptionsQuery } from "../prescription.api";
import { getFrequencyLabel, getDurationLabel } from "../prescription.constants";
import { PrescriptionPreviewDialog } from "./prescription-preview-dialog";
import type { PrescriptionResponseDto } from "../prescription.dto";

type PatientPrescriptionsHistoryProps = {
  patientId: string;
  currentVisitId?: string;
  defaultCollapsed?: boolean;
};

export const PatientPrescriptionsHistory = ({
  patientId,
  currentVisitId,
  defaultCollapsed = true,
}: PatientPrescriptionsHistoryProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [previewPrescription, setPreviewPrescription] =
    useState<PrescriptionResponseDto | null>(null);

  const { data, isLoading } = useGetPrescriptionsQuery({
    patientId,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Filter out current visit prescriptions to show only history
  const prescriptions =
    data?.data.filter((p) => p.visit?.id !== currentVisitId) ?? [];

  const handlePreview = useCallback((prescription: PrescriptionResponseDto) => {
    setPreviewPrescription(prescription);
  }, []);

  if (isLoading) {
    return (
      <div className="p-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 px-1 hover:bg-muted/50 rounded-md transition-colors">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">История рецептов</span>
            {prescriptions.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {prescriptions.length}
              </Badge>
            )}
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="pt-2">
            {prescriptions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 px-1">
                Нет предыдущих рецептов
              </p>
            ) : (
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-1.5 pr-2">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {prescription.name}
                          {prescription.dosage && (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              {prescription.dosage}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {prescription.frequency && (
                            <span>
                              {getFrequencyLabel(prescription.frequency)}
                            </span>
                          )}
                          {prescription.frequency && prescription.duration && (
                            <span>•</span>
                          )}
                          {prescription.duration && (
                            <span>
                              {getDurationLabel(prescription.duration)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {format(
                            new Date(prescription.createdAt),
                            "dd.MM.yy",
                            { locale: ru }
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePreview(prescription)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <PrescriptionPreviewDialog
        prescription={previewPrescription}
        open={!!previewPrescription}
        onOpenChange={(open) => !open && setPreviewPrescription(null)}
      />
    </>
  );
};
