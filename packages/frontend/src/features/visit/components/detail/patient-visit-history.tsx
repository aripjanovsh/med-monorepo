"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  History,
  Copy,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Eye,
  ClipboardCopy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGetVisitsQuery } from "../../visit.api";
import { VisitIncludeRelation, type VisitResponseDto } from "../../visit.dto";
import { VISIT_STATUS_LABELS } from "../../visit.constants";
import { VisitStatusBadge } from "../visit-status-badge";
import { VisitPreviewDialog } from "./visit-preview-dialog";
import type { SavedProtocolData } from "../../visit-protocol.types";

type PatientVisitHistoryProps = {
  patientId: string;
  currentVisitId: string;
  isEditable: boolean;
  defaultCollapsed?: boolean;
  onCopyComplaint?: (text: string) => void;
  onCopyAnamnesis?: (text: string) => void;
  onCopyDiagnosis?: (text: string) => void;
  onCopyConclusion?: (text: string) => void;
  onCopyProtocol?: (protocolData: SavedProtocolData) => void;
  onCopyAll?: (data: {
    complaint?: string;
    anamnesis?: string;
    diagnosis?: string;
    conclusion?: string;
    protocolData?: string;
    protocolId?: string;
  }) => void;
};

type ExpandedVisits = Record<string, boolean>;

export const PatientVisitHistory = ({
  patientId,
  currentVisitId,
  isEditable,
  defaultCollapsed = false,
  onCopyComplaint,
  onCopyAnamnesis,
  onCopyDiagnosis,
  onCopyConclusion,
  onCopyProtocol,
  onCopyAll,
}: PatientVisitHistoryProps) => {
  const [expandedVisits, setExpandedVisits] = useState<ExpandedVisits>({});
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [previewVisit, setPreviewVisit] = useState<VisitResponseDto | null>(
    null
  );

  const { data: visitsData, isLoading } = useGetVisitsQuery({
    patientId,
    limit: 20,
    include: [VisitIncludeRelation.EMPLOYEE, VisitIncludeRelation.PROTOCOL],
  });

  const visits = visitsData?.data.filter((v) => v.id !== currentVisitId) ?? [];

  const toggleVisitExpanded = useCallback((visitId: string) => {
    setExpandedVisits((prev) => ({
      ...prev,
      [visitId]: !prev[visitId],
    }));
  }, []);

  const handleCopyField = useCallback(
    (
      field: string,
      value: string | undefined,
      handler?: (text: string) => void
    ) => {
      if (!value) {
        toast.error("Нет данных для копирования");
        return;
      }
      if (handler) {
        handler(value);
        toast.success(`${field} скопировано`);
      }
    },
    []
  );

  const handleCopyAll = useCallback(
    (visit: VisitResponseDto) => {
      if (onCopyAll) {
        onCopyAll({
          complaint: visit.complaint,
          anamnesis: visit.anamnesis,
          diagnosis: visit.diagnosis,
          conclusion: visit.conclusion,
          protocolData: visit.protocolData,
          protocolId: visit.protocol?.id,
        });
        toast.success("Все данные скопированы в текущий визит");
      }
    },
    [onCopyAll]
  );

  const handleCopyProtocol = useCallback(
    (visit: VisitResponseDto) => {
      if (!visit.protocolData) {
        toast.error("Нет протокола для копирования");
        return;
      }
      try {
        const protocolData: SavedProtocolData = JSON.parse(visit.protocolData);
        onCopyProtocol?.(protocolData);
        toast.success("Протокол скопирован");
      } catch {
        toast.error("Ошибка при копировании протокола");
      }
    },
    [onCopyProtocol]
  );

  const handleOpenPreview = useCallback((visit: VisitResponseDto) => {
    setPreviewVisit(visit);
  }, []);

  const formatVisitDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy", { locale: ru });
  };

  const formatVisitTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: ru });
  };

  const renderVisitItem = (visit: VisitResponseDto) => {
    const isExpanded = expandedVisits[visit.id] ?? false;
    const hasContent =
      visit.complaint || visit.anamnesis || visit.diagnosis || visit.conclusion;
    const hasProtocol = !!visit.protocolData;

    return (
      <Collapsible
        key={visit.id}
        open={isExpanded}
        onOpenChange={() => toggleVisitExpanded(visit.id)}
      >
        <div
          className={cn(
            "rounded-lg border bg-card transition-colors",
            isExpanded && "ring-1 ring-primary/20"
          )}
        >
          {/* Visit Header */}
          <CollapsibleTrigger asChild>
            <button className="w-full p-3 text-left hover:bg-muted/50 transition-colors rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">
                      {formatVisitDate(visit.visitDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatVisitTime(visit.visitDate)}
                    </span>
                  </div>
                  {visit.employee && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {visit.employee.lastName}{" "}
                        {visit.employee.firstName?.charAt(0) ?? ""}.
                      </span>
                    </div>
                  )}
                  {visit.diagnosis && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      <span className="font-medium">Диагноз:</span>{" "}
                      {visit.diagnosis}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <VisitStatusBadge status={visit.status} size="sm" />
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </button>
          </CollapsibleTrigger>

          {/* Expanded Content */}
          <CollapsibleContent>
            <div className="p-3 space-y-3 border-t">
              {!hasContent ? (
                <p className="text-sm text-muted-foreground py-2">
                  Нет клинических данных
                </p>
              ) : (
                <>
                  {/* Complaint */}
                  {visit.complaint && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Жалобы
                        </span>
                        {isEditable && onCopyComplaint && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyField(
                                    "Жалобы",
                                    visit.complaint,
                                    onCopyComplaint
                                  );
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Скопировать жалобы</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3">{visit.complaint}</p>
                    </div>
                  )}

                  {/* Anamnesis */}
                  {visit.anamnesis && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Анамнез
                        </span>
                        {isEditable && onCopyAnamnesis && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyField(
                                    "Анамнез",
                                    visit.anamnesis,
                                    onCopyAnamnesis
                                  );
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Скопировать анамнез</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3">{visit.anamnesis}</p>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {visit.diagnosis && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Диагноз
                        </span>
                        {isEditable && onCopyDiagnosis && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyField(
                                    "Диагноз",
                                    visit.diagnosis,
                                    onCopyDiagnosis
                                  );
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Скопировать диагноз</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm font-medium">{visit.diagnosis}</p>
                    </div>
                  )}

                  {/* Conclusion */}
                  {visit.conclusion && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Заключение
                        </span>
                        {isEditable && onCopyConclusion && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyField(
                                    "Заключение",
                                    visit.conclusion,
                                    onCopyConclusion
                                  );
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Скопировать заключение
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3">{visit.conclusion}</p>
                    </div>
                  )}

                  {/* Protocol Copy Button */}
                  {isEditable && hasProtocol && onCopyProtocol && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyProtocol(visit);
                      }}
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      Скопировать протокол
                    </Button>
                  )}

                  {/* Copy All Button */}
                  {isEditable && onCopyAll && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAll(visit);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Скопировать всё
                    </Button>
                  )}
                </>
              )}

              {/* Action buttons row */}
              <div className="flex gap-2 pt-2 border-t mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPreview(visit);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Просмотр
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            История визитов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5" />
                  История визитов
                  {visits.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {visits.length}
                    </Badge>
                  )}
                </CardTitle>
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {visits.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Нет предыдущих визитов</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-3">
                  <div className="space-y-2">{visits.map(renderVisitItem)}</div>
                </ScrollArea>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Preview Dialog */}
      <VisitPreviewDialog
        visit={previewVisit}
        open={!!previewVisit}
        onOpenChange={(open) => !open && setPreviewVisit(null)}
      />
    </>
  );
};
