"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Save, Loader2, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUpdateVisitMutation } from "../../visit.api";
import type { VisitResponseDto } from "../../visit.dto";

type ClinicalFieldsData = {
  complaint: string;
  anamnesis: string;
  diagnosis: string;
  conclusion: string;
};

type VisitClinicalFieldsProps = {
  visit: VisitResponseDto;
  isEditable: boolean;
  onDataChange?: (data: ClinicalFieldsData) => void;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 2000;

export const VisitClinicalFields = ({
  visit,
  isEditable,
  onDataChange,
}: VisitClinicalFieldsProps) => {
  const [formData, setFormData] = useState<ClinicalFieldsData>({
    complaint: visit.complaint ?? "",
    anamnesis: visit.anamnesis ?? "",
    diagnosis: visit.diagnosis ?? "",
    conclusion: visit.conclusion ?? "",
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<ClinicalFieldsData>(formData);

  const [updateVisit] = useUpdateVisitMutation();

  // Check if data has changed from last saved
  const hasChanges = useCallback((data: ClinicalFieldsData) => {
    return (
      data.complaint !== lastSavedDataRef.current.complaint ||
      data.anamnesis !== lastSavedDataRef.current.anamnesis ||
      data.diagnosis !== lastSavedDataRef.current.diagnosis ||
      data.conclusion !== lastSavedDataRef.current.conclusion
    );
  }, []);

  // Save function
  const saveData = useCallback(
    async (data: ClinicalFieldsData) => {
      if (!hasChanges(data)) {
        return;
      }

      setSaveStatus("saving");
      try {
        await updateVisit({
          id: visit.id,
          complaint: data.complaint || undefined,
          anamnesis: data.anamnesis || undefined,
          diagnosis: data.diagnosis || undefined,
          conclusion: data.conclusion || undefined,
        }).unwrap();

        lastSavedDataRef.current = data;
        setSaveStatus("saved");
        setHasUnsavedChanges(false);

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error: unknown) {
        setSaveStatus("error");
        const errorMessage =
          error && typeof error === "object" && "data" in error
            ? (error.data as { message?: string })?.message
            : undefined;
        toast.error(errorMessage ?? "Ошибка при сохранении");
      }
    },
    [updateVisit, visit.id, hasChanges]
  );

  // Handle field change with autosave
  const handleFieldChange = useCallback(
    (field: keyof ClinicalFieldsData, value: string) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      setHasUnsavedChanges(hasChanges(newData));
      onDataChange?.(newData);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new autosave timeout
      if (isEditable) {
        saveTimeoutRef.current = setTimeout(() => {
          saveData(newData);
        }, AUTOSAVE_DELAY_MS);
      }
    },
    [formData, isEditable, saveData, onDataChange, hasChanges]
  );

  // Manual save
  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveData(formData);
  }, [saveData, formData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update form data when visit changes (e.g., from history copy)
  useEffect(() => {
    const newData = {
      complaint: visit.complaint ?? "",
      anamnesis: visit.anamnesis ?? "",
      diagnosis: visit.diagnosis ?? "",
      conclusion: visit.conclusion ?? "",
    };
    setFormData(newData);
    lastSavedDataRef.current = newData;
    setHasUnsavedChanges(false);
  }, [
    visit.id,
    visit.complaint,
    visit.anamnesis,
    visit.diagnosis,
    visit.conclusion,
  ]);

  const renderSaveStatus = () => {
    if (!isEditable) return null;

    return (
      <div className="flex items-center gap-2">
        {saveStatus === "saving" && (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Сохранение...
          </Badge>
        )}
        {saveStatus === "saved" && (
          <Badge
            variant="secondary"
            className="gap-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
          >
            <Check className="h-3 w-3" />
            Сохранено
          </Badge>
        )}
        {saveStatus === "error" && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Ошибка
          </Badge>
        )}
        {hasUnsavedChanges && saveStatus === "idle" && (
          <Badge variant="outline" className="gap-1">
            Несохраненные изменения
          </Badge>
        )}
        {hasUnsavedChanges && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
          >
            <Save className="h-4 w-4 mr-1" />
            Сохранить
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Клинические данные</CardTitle>
          {renderSaveStatus()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Жалобы */}
        <div className="space-y-2">
          <Label htmlFor="complaint" className="text-sm font-medium">
            Жалобы
          </Label>
          <Textarea
            id="complaint"
            placeholder="Опишите жалобы пациента..."
            value={formData.complaint}
            onChange={(e) => handleFieldChange("complaint", e.target.value)}
            disabled={!isEditable}
            rows={3}
            className={cn(
              "resize-none",
              !isEditable && "bg-muted cursor-not-allowed"
            )}
          />
        </div>

        {/* Анамнез */}
        <div className="space-y-2">
          <Label htmlFor="anamnesis" className="text-sm font-medium">
            Анамнез
          </Label>
          <Textarea
            id="anamnesis"
            placeholder="История болезни, когда началось, что принимал..."
            value={formData.anamnesis}
            onChange={(e) => handleFieldChange("anamnesis", e.target.value)}
            disabled={!isEditable}
            rows={3}
            className={cn(
              "resize-none",
              !isEditable && "bg-muted cursor-not-allowed"
            )}
          />
        </div>

        {/* Диагноз */}
        <div className="space-y-2">
          <Label htmlFor="diagnosis" className="text-sm font-medium">
            Диагноз
          </Label>
          <Textarea
            id="diagnosis"
            placeholder="Установленный диагноз..."
            value={formData.diagnosis}
            onChange={(e) => handleFieldChange("diagnosis", e.target.value)}
            disabled={!isEditable}
            rows={2}
            className={cn(
              "resize-none",
              !isEditable && "bg-muted cursor-not-allowed"
            )}
          />
        </div>

        {/* Заключение */}
        <div className="space-y-2">
          <Label htmlFor="conclusion" className="text-sm font-medium">
            Заключение и рекомендации
          </Label>
          <Textarea
            id="conclusion"
            placeholder="Рекомендации по лечению, режиму..."
            value={formData.conclusion}
            onChange={(e) => handleFieldChange("conclusion", e.target.value)}
            disabled={!isEditable}
            rows={3}
            className={cn(
              "resize-none",
              !isEditable && "bg-muted cursor-not-allowed"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
