"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DemographicRange = {
  group: string;
  min?: number;
  max?: number;
};

type ReferenceRangesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parameterName: string;
  unit?: string;
  ranges: Record<string, { min?: number; max?: number }>;
  onSave: (ranges: Record<string, { min?: number; max?: number }>) => void;
};

const DEFAULT_GROUPS = [
  { key: "men", label: "Мужчины" },
  { key: "women", label: "Женщины" },
  { key: "children", label: "Дети" },
];

export const ReferenceRangesModal = ({
  open,
  onOpenChange,
  parameterName,
  unit,
  ranges,
  onSave,
}: ReferenceRangesModalProps) => {
  const [localRanges, setLocalRanges] = useState<DemographicRange[]>([]);

  // Update local ranges when modal opens or ranges change
  useEffect(() => {
    if (open) {
      const initial: DemographicRange[] = [];
      
      // Check if we have simple default range
      const hasDefault = ranges.default;
      
      // Add default groups
      DEFAULT_GROUPS.forEach(({ key, label }) => {
        if (ranges[key]) {
          initial.push({ group: label, ...ranges[key] });
        } else if (hasDefault) {
          // Copy default range to all groups
          initial.push({ group: label, ...ranges.default });
        } else {
          initial.push({ group: label });
        }
      });

      // Add custom groups (skip "default" key)
      Object.entries(ranges).forEach(([key, value]) => {
        if (key === "default") return;
        const isDefault = DEFAULT_GROUPS.some((g) => g.key === key);
        if (!isDefault) {
          initial.push({ group: key, ...value });
        }
      });

      setLocalRanges(initial.length > 0 ? initial : [{ group: "Мужчины" }]);
    }
  }, [open, ranges]);

  const handleAddRange = () => {
    setLocalRanges([...localRanges, { group: "" }]);
  };

  const handleRemoveRange = (index: number) => {
    setLocalRanges(localRanges.filter((_, i) => i !== index));
  };

  const handleUpdateRange = (
    index: number,
    field: keyof DemographicRange,
    value: string | number
  ) => {
    const updated = [...localRanges];
    if (field === "group") {
      updated[index].group = value as string;
    } else if (field === "min" || field === "max") {
      const numValue = value === "" ? undefined : parseFloat(value as string);
      updated[index][field] = numValue;
    }
    setLocalRanges(updated);
  };

  const handleSave = () => {
    const result: Record<string, { min?: number; max?: number }> = {};
    
    localRanges.forEach((range) => {
      if (range.group.trim()) {
        // Convert label back to key for default groups
        const defaultGroup = DEFAULT_GROUPS.find((g) => g.label === range.group);
        const key = defaultGroup ? defaultGroup.key : range.group.toLowerCase().replace(/\s+/g, "_");
        
        result[key] = {
          min: range.min,
          max: range.max,
        };
      }
    });

    onSave(result);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Референсные значения: {parameterName}</DialogTitle>
          <DialogDescription>
            Укажите нормальные диапазоны значений для разных групп
            {unit && ` (${unit})`}
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Группа</TableHead>
                <TableHead className="w-[25%]">Минимум</TableHead>
                <TableHead className="w-[25%]">Максимум</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localRanges.map((range, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={range.group}
                      onChange={(e) =>
                        handleUpdateRange(index, "group", e.target.value)
                      }
                      placeholder="Название группы"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={range.min ?? ""}
                      onChange={(e) =>
                        handleUpdateRange(index, "min", e.target.value)
                      }
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={range.max ?? ""}
                      onChange={(e) =>
                        handleUpdateRange(index, "max", e.target.value)
                      }
                      placeholder="100"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRange(index)}
                      disabled={localRanges.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddRange}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить группу
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
