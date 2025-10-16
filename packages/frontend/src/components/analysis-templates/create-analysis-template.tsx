"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";

interface ReferenceRange {
  min?: number;
  max?: number;
}

interface AnalysisParameter {
  id: string;
  name: string;
  unit: string;
  type: "number" | "text" | "boolean";
  reference_ranges?: {
    men?: ReferenceRange;
    women?: ReferenceRange;
    children?: ReferenceRange;
  };
  is_required: boolean;
}

interface AnalysisTemplate {
  name: string;
  code: string;
  category: string;
  description: string;
  parameters: Omit<AnalysisParameter, 'id'>[];
}

interface CreateAnalysisTemplateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAnalysisTemplate({ onSuccess, onCancel }: CreateAnalysisTemplateProps) {
  const [template, setTemplate] = useState<Omit<AnalysisTemplate, 'parameters'>>({
    name: "",
    code: "",
    category: "",
    description: "",
  });

  const [parameters, setParameters] = useState<AnalysisParameter[]>([]);

  const categories = [
    { value: "blood", label: "Кровь" },
    { value: "urine", label: "Моча" },
    { value: "biochemistry", label: "Биохимия" },
    { value: "other", label: "Другое" },
  ];

  const dataTypes = [
    { value: "number", label: "Число" },
    { value: "text", label: "Текст" },
    { value: "boolean", label: "Да/Нет" },
  ];

  const addParameter = () => {
    const newParameter: AnalysisParameter = {
      id: Date.now().toString(),
      name: "",
      unit: "",
      type: "number",
      reference_ranges: {
        men: { min: undefined, max: undefined },
        women: { min: undefined, max: undefined },
        children: { min: undefined, max: undefined },
      },
      is_required: false,
    };
    setParameters([...parameters, newParameter]);
  };

  const updateParameter = (id: string, field: keyof AnalysisParameter, value: any) => {
    setParameters(parameters.map(param => 
      param.id === id ? { ...param, [field]: value } : param
    ));
  };

  const removeParameter = (id: string) => {
    setParameters(parameters.filter(param => param.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalTemplate: AnalysisTemplate = {
      ...template,
      parameters: parameters.map(({ id, ...param }) => param),
    };

    console.log("Analysis Template:", JSON.stringify(finalTemplate, null, 2));
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация о шаблоне */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название анализа *</Label>
              <Input
                id="name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="Например: Общий анализ крови"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Код анализа *</Label>
              <Input
                id="code"
                value={template.code}
                onChange={(e) => setTemplate({ ...template, code: e.target.value })}
                placeholder="Например: OAK-001"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Категория *</Label>
            <Select
              value={template.category}
              onValueChange={(value) => setTemplate({ ...template, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              placeholder="Описание анализа и его назначение"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Параметры анализа */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Параметры анализа</CardTitle>
          <Button type="button" variant="outline" onClick={addParameter}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить параметр
          </Button>
        </CardHeader>
        <CardContent>
          {parameters.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Нет параметров. Добавьте параметры для анализа.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Название *</TableHead>
                  <TableHead className="w-[120px]">Единица</TableHead>
                  <TableHead className="w-[120px]">Тип данных</TableHead>
                  <TableHead className="w-[100px]">Норма мин</TableHead>
                  <TableHead className="w-[100px]">Норма макс</TableHead>
                  <TableHead className="w-[120px]">Обязательно</TableHead>
                  <TableHead className="w-[80px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameters.map((parameter) => (
                  <TableRow key={parameter.id}>
                    <TableCell>
                      <Input
                        value={parameter.name}
                        onChange={(e) => updateParameter(parameter.id, 'name', e.target.value)}
                        placeholder="Например: Гемоглобин"
                        className="h-8"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={parameter.unit}
                        onChange={(e) => updateParameter(parameter.id, 'unit', e.target.value)}
                        placeholder="г/л"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={parameter.type}
                        onValueChange={(value: "number" | "text" | "boolean") => 
                          updateParameter(parameter.id, 'type', value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dataTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={parameter.ref_min || ""}
                        onChange={(e) => 
                          updateParameter(parameter.id, 'ref_min', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        placeholder="0"
                        className="h-8"
                        disabled={parameter.type !== "number"}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={parameter.ref_max || ""}
                        onChange={(e) => 
                          updateParameter(parameter.id, 'ref_max', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        placeholder="100"
                        className="h-8"
                        disabled={parameter.type !== "number"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Checkbox
                          id={`required-${parameter.id}`}
                          checked={parameter.is_required}
                          onCheckedChange={(checked) => 
                            updateParameter(parameter.id, 'is_required', checked)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeParameter(parameter.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          Сохранить шаблон
        </Button>
      </div>
    </form>
  );
}
