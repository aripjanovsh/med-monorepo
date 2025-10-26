"use client";

import { useState } from "react";
import { Plus, Settings2, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReferenceRangesModal } from "./reference-ranges-modal";
import { PARAMETER_TYPE_OPTIONS } from "../analysis-template.constants";

type Parameter = {
  id: string;
  name: string;
  unit?: string;
  type: "NUMBER" | "TEXT" | "BOOLEAN";
  referenceRanges?: Record<string, { min?: number; max?: number }>;
  isRequired: boolean;
};

type ParametersTableProps = {
  parameters: Parameter[];
  onParametersChange: (parameters: Parameter[]) => void;
};

export const ParametersTable = ({
  parameters,
  onParametersChange,
}: ParametersTableProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(
    null
  );

  const selectedParameter = parameters.find((p) => p.id === selectedParameterId);

  const addParameter = () => {
    const newParameter: Parameter = {
      id: Date.now().toString(),
      name: "",
      unit: "",
      type: "NUMBER",
      referenceRanges: {},
      isRequired: false,
    };
    onParametersChange([...parameters, newParameter]);
  };

  const removeParameter = (id: string) => {
    onParametersChange(parameters.filter((p) => p.id !== id));
  };

  const duplicateParameter = (id: string) => {
    const param = parameters.find((p) => p.id === id);
    if (param) {
      const newParam: Parameter = {
        ...param,
        id: Date.now().toString(),
        name: `${param.name} (копия)`,
      };
      onParametersChange([...parameters, newParam]);
    }
  };

  const updateParameter = (id: string, field: keyof Parameter, value: any) => {
    onParametersChange(
      parameters.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const openRangesModal = (id: string) => {
    setSelectedParameterId(id);
    setModalOpen(true);
  };

  const handleRangesSave = (
    ranges: Record<string, { min?: number; max?: number }>
  ) => {
    if (selectedParameterId) {
      updateParameter(selectedParameterId, "referenceRanges", ranges);
    }
  };

  const getSimpleRange = (
    ranges?: Record<string, { min?: number; max?: number }>
  ): { min?: number; max?: number } => {
    if (!ranges || Object.keys(ranges).length === 0) {
      return {};
    }
    // Prioritize default range if exists
    if (ranges.default) {
      return ranges.default;
    }
    // Otherwise get first non-empty range
    const firstRange = Object.values(ranges).find(
      (r) => r && (r.min !== undefined || r.max !== undefined)
    );
    return firstRange || {};
  };

  const updateSimpleRange = (
    id: string,
    field: "min" | "max",
    value: string
  ) => {
    const param = parameters.find((p) => p.id === id);
    if (!param) return;

    const numValue = value === "" ? undefined : parseFloat(value);
    const currentRanges = param.referenceRanges || {};
    
    // If has extended ranges, update first one only
    if (Object.keys(currentRanges).length > 0) {
      const firstKey = Object.keys(currentRanges)[0];
      const updatedRanges = {
        ...currentRanges,
        [firstKey]: {
          ...currentRanges[firstKey],
          [field]: numValue,
        },
      };
      updateParameter(id, "referenceRanges", updatedRanges);
    } else {
      // Create default range
      updateParameter(id, "referenceRanges", {
        default: { [field]: numValue },
      });
    }
  };

  const formatRangePreview = (
    ranges?: Record<string, { min?: number; max?: number }>
  ): string => {
    if (!ranges || Object.keys(ranges).length === 0) {
      return "Нет диапазонов";
    }

    const groupLabels: Record<string, string> = {
      men: "М",
      women: "Ж",
      children: "Д",
      default: "Общий",
    };

    return Object.entries(ranges)
      .slice(0, 3)
      .map(([key, range]) => {
        const label = groupLabels[key] || key;
        const min = range.min !== undefined ? range.min : "—";
        const max = range.max !== undefined ? range.max : "—";
        return `${label}: ${min}-${max}`;
      })
      .join(", ") + (Object.keys(ranges).length > 3 ? "..." : "");
  };

  return (
    <>
      <div className="space-y-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Название *</TableHead>
                <TableHead className="w-[12%]">Единица</TableHead>
                <TableHead className="w-[12%]">Тип данных</TableHead>
                <TableHead className="w-[20%]">Референсные значения</TableHead>
                <TableHead className="w-[8%]">Обязат.</TableHead>
                <TableHead className="w-[16%]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Нет параметров. Добавьте параметры для анализа.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addParameter}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить первый параметр
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                parameters.map((parameter) => {
                  const rangeCount = parameter.referenceRanges
                    ? Object.keys(parameter.referenceRanges).length
                    : 0;
                  const isExtendedRanges = rangeCount > 1;

                  return (
                    <TableRow key={parameter.id}>
                      <TableCell>
                        <Input
                          value={parameter.name}
                          onChange={(e) =>
                            updateParameter(parameter.id, "name", e.target.value)
                          }
                          placeholder="Гемоглобин"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={parameter.unit ?? ""}
                          onChange={(e) =>
                            updateParameter(parameter.id, "unit", e.target.value)
                          }
                          placeholder="г/л"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={parameter.type}
                          onValueChange={(value) =>
                            updateParameter(parameter.id, "type", value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PARAMETER_TYPE_OPTIONS.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {parameter.type === "NUMBER" ? (
                          <div className="flex items-center gap-1.5">
                            {!isExtendedRanges ? (
                              <>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    getSimpleRange(parameter.referenceRanges)
                                      .min ?? ""
                                  }
                                  onChange={(e) =>
                                    updateSimpleRange(
                                      parameter.id,
                                      "min",
                                      e.target.value
                                    )
                                  }
                                  placeholder="От"
                                  className="h-9 w-full"
                                />
                                <span className="text-muted-foreground">—</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    getSimpleRange(parameter.referenceRanges)
                                      .max ?? ""
                                  }
                                  onChange={(e) =>
                                    updateSimpleRange(
                                      parameter.id,
                                      "max",
                                      e.target.value
                                    )
                                  }
                                  placeholder="До"
                                  className="h-9 w-full"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openRangesModal(parameter.id)}
                                  title="Настроить по группам"
                                  className="h-9 px-2 shrink-0"
                                >
                                  <Settings2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1.5 w-full">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 justify-between flex-1"
                                  onClick={() => openRangesModal(parameter.id)}
                                >
                                  <span className="truncate text-sm">
                                    {formatRangePreview(parameter.referenceRanges)}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs shrink-0"
                                  >
                                    {rangeCount}
                                  </Badge>
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={parameter.isRequired}
                            onCheckedChange={(checked) =>
                              updateParameter(
                                parameter.id,
                                "isRequired",
                                checked
                              )
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateParameter(parameter.id)}
                            title="Дублировать"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParameter(parameter.id)}
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {parameters.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={addParameter}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить параметр
          </Button>
        )}
      </div>

      {selectedParameter && (
        <ReferenceRangesModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          parameterName={selectedParameter.name || "Параметр"}
          unit={selectedParameter.unit}
          ranges={selectedParameter.referenceRanges || {}}
          onSave={handleRangesSave}
        />
      )}
    </>
  );
};
