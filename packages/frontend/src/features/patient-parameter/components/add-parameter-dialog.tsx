"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2 } from "lucide-react";
import { useCreatePatientParameterMutation } from "../patient-parameter.api";
import { useGetParameterDefinitionsQuery } from "@/features/parameter-definition";
import { toast } from "sonner";

type AddParameterDialogProps = {
  patientId: string;
  recordedById: string;
  visitId?: string;
};

type ParameterValues = Record<string, string>;

export const AddParameterDialog = ({
  patientId,
  recordedById,
  visitId,
}: AddParameterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ParameterValues>({});
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [createParameter, { isLoading }] = useCreatePatientParameterMutation();
  const { data: definitionsData, isLoading: isLoadingDefinitions } =
    useGetParameterDefinitionsQuery({ isActive: true });
  const parameterDefinitions = definitionsData?.data || [];

  const handleValueChange = (code: string, value: string) => {
    setValues((prev) => ({ ...prev, [code]: value }));
  };

  const handleSubmit = async () => {
    const parametersToAdd: Array<{
      code: string;
      value: string;
      definition: (typeof parameterDefinitions)[number];
    }> = [];

    // Собираем все заполненные параметры
    for (const [code, value] of Object.entries(values)) {
      if (value.trim()) {
        const definition = parameterDefinitions.find((p) => p.code === code);
        if (definition) {
          parametersToAdd.push({ code, value, definition });
        }
      }
    }

    // Добавляем артериальное давление если оба значения заполнены
    if (bpSystolic.trim() && bpDiastolic.trim()) {
      const bpSysDef = parameterDefinitions.find((p) => p.code === "BP_SYS");
      const bpDiaDef = parameterDefinitions.find((p) => p.code === "BP_DIA");
      if (bpSysDef && bpDiaDef) {
        parametersToAdd.push({
          code: "BP_SYS",
          value: bpSystolic,
          definition: bpSysDef,
        });
        parametersToAdd.push({
          code: "BP_DIA",
          value: bpDiastolic,
          definition: bpDiaDef,
        });
      }
    }

    if (parametersToAdd.length === 0) {
      toast.error("Заполните хотя бы один параметр");
      return;
    }

    try {
      // Создаем все параметры
      await Promise.all(
        parametersToAdd.map(({ code, value, definition }) => {
          const valueNumeric =
            definition.valueType === "NUMBER"
              ? Number.parseFloat(value)
              : undefined;
          const valueText = definition.valueType === "TEXT" ? value : undefined;
          const valueBoolean =
            definition.valueType === "BOOLEAN" ? value === "true" : undefined;

          return createParameter({
            patientId,
            visitId,
            recordedById,
            parameterCode: code,
            valueNumeric,
            valueText,
            valueBoolean,
            unit: definition.defaultUnit,
            source: "MANUAL",
          }).unwrap();
        })
      );

      toast.success(`Добавлено параметров: ${parametersToAdd.length}`);
      setOpen(false);
      setValues({});
      setBpSystolic("");
      setBpDiastolic("");
    } catch (error) {
      toast.error("Ошибка при добавлении параметров");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setValues({});
    setBpSystolic("");
    setBpDiastolic("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Добавить показатели
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Добавить показатели пациента</DialogTitle>
        </DialogHeader>
        {isLoadingDefinitions ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4 pb-4">
              {/* Жизненные показатели */}
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Жизненные показатели
                </h3>
                <div className="space-y-3">
                  {parameterDefinitions
                    .filter(
                      (p) =>
                        p.category === "VITALS_CORE" &&
                        p.code !== "BP_SYS" &&
                        p.code !== "BP_DIA"
                    )
                    .map((param) => (
                      <div
                        key={param.code}
                        className="grid grid-cols-2 gap-4 items-center"
                      >
                        <Label htmlFor={param.code}>
                          {param.name}{" "}
                          {param.defaultUnit && (
                            <span className="text-muted-foreground">
                              ({param.defaultUnit})
                            </span>
                          )}
                        </Label>
                        <Input
                          id={param.code}
                          type={
                            param.valueType === "NUMBER" ? "number" : "text"
                          }
                          placeholder="Введите значение"
                          value={values[param.code] || ""}
                          onChange={(e) =>
                            handleValueChange(param.code, e.target.value)
                          }
                        />
                      </div>
                    ))}

                  {/* Специальное поле для артериального давления */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>
                      Артериальное давление{" "}
                      <span className="text-muted-foreground">(mmHg)</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-24"
                        type="number"
                        placeholder="Верхнее"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                      />
                      <span>/</span>
                      <Input
                        className="w-24"
                        type="number"
                        placeholder="Нижнее"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Антропометрия */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Антропометрия</h3>
                <div className="space-y-3">
                  {parameterDefinitions
                    .filter((p) => p.category === "ANTHROPOMETRY")
                    .map((param) => (
                      <div
                        key={param.code}
                        className="grid grid-cols-2 gap-4 items-center"
                      >
                        <Label htmlFor={param.code}>
                          {param.name}{" "}
                          {param.defaultUnit && (
                            <span className="text-muted-foreground">
                              ({param.defaultUnit})
                            </span>
                          )}
                        </Label>
                        <Input
                          id={param.code}
                          type={
                            param.valueType === "NUMBER" ? "number" : "text"
                          }
                          placeholder="Введите значение"
                          value={values[param.code] || ""}
                          onChange={(e) =>
                            handleValueChange(param.code, e.target.value)
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Добавление...
              </>
            ) : (
              "Добавить"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
