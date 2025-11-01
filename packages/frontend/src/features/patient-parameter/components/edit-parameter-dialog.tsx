"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import { useUpdatePatientParameterMutation } from "../patient-parameter.api";
import { useGetParameterDefinitionsQuery } from "@/features/parameter-definition";
import type { PatientParameter } from "../patient-parameter.model";
import { toast } from "sonner";

/**
 * Пропсы для EditParameterDialog (без базовых DialogProps)
 */
type EditParameterDialogOwnProps = {
  parameter: PatientParameter;
};

/**
 * Полные пропсы с DialogProps
 */
type EditParameterDialogProps = EditParameterDialogOwnProps & DialogProps;

export const EditParameterDialog = ({
  parameter,
  open,
  onOpenChange,
}: EditParameterDialogProps) => {
  const [value, setValue] = useState(() => {
    if (parameter.valueNumeric !== undefined && parameter.valueNumeric !== null) {
      return String(parameter.valueNumeric);
    }
    if (parameter.valueText) return parameter.valueText;
    if (parameter.valueBoolean !== null && parameter.valueBoolean !== undefined) {
      return parameter.valueBoolean ? "true" : "false";
    }
    return "";
  });
  const [updateParameter, { isLoading }] = useUpdatePatientParameterMutation();
  const { data: definitionsData } = useGetParameterDefinitionsQuery({ isActive: true });
  const parameterDefinitions = definitionsData?.data || [];

  const definition = parameterDefinitions.find(
    (p) => p.code === parameter.parameterCode
  );

  const handleSubmit = async () => {
    if (!value.trim() || !definition) {
      toast.error("Введите значение");
      return;
    }

    try {
      const valueNumeric =
        definition.valueType === "NUMBER"
          ? Number.parseFloat(value)
          : undefined;
      const valueText = definition.valueType === "TEXT" ? value : undefined;
      const valueBoolean =
        definition.valueType === "BOOLEAN" ? value === "true" : undefined;

      await updateParameter({
        id: parameter.id,
        data: {
          valueNumeric,
          valueText,
          valueBoolean,
        },
      }).unwrap();

      toast.success("Параметр успешно обновлен");
      onOpenChange(false);
    } catch (error) {
      toast.error("Ошибка при обновлении параметра");
    }
  };

  if (!definition) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать параметр</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parameter-name">Параметр</Label>
            <Input
              id="parameter-name"
              value={definition.name}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parameter-value">
              Значение
              {definition.defaultUnit && (
                <span className="text-muted-foreground ml-1">
                  ({definition.defaultUnit})
                </span>
              )}
            </Label>
            <Input
              id="parameter-value"
              type={definition.valueType === "NUMBER" ? "number" : "text"}
              placeholder="Введите значение"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
