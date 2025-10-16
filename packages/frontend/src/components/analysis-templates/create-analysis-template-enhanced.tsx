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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Copy, Wand2, Users, User, Baby } from "lucide-react";

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

interface CreateAnalysisTemplateEnhancedProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Предустановленные шаблоны
const PRESET_TEMPLATES = [
  {
    name: "Общий анализ крови",
    code: "OAK",
    category: "blood",
    description: "Базовый анализ крови для оценки общего состояния здоровья",
    parameters: [
      {
        name: "Гемоглобин",
        unit: "г/л",
        type: "number" as const,
        reference_ranges: {
          men: { min: 130, max: 160 },
          women: { min: 120, max: 150 },
          children: { min: 100, max: 140 }
        },
        is_required: true
      },
      {
        name: "Эритроциты",
        unit: "×10¹²/л",
        type: "number" as const,
        reference_ranges: {
          men: { min: 4.4, max: 5.0 },
          women: { min: 3.8, max: 4.5 },
          children: { min: 3.5, max: 4.5 }
        },
        is_required: true
      },
      {
        name: "Лейкоциты",
        unit: "×10⁹/л",
        type: "number" as const,
        reference_ranges: {
          men: { min: 4.0, max: 9.0 },
          women: { min: 4.0, max: 9.0 },
          children: { min: 5.0, max: 12.0 }
        },
        is_required: true
      }
    ]
  },
  {
    name: "Биохимия крови базовая",
    code: "BIO",
    category: "biochemistry",
    description: "Основные биохимические показатели",
    parameters: [
      {
        name: "Глюкоза",
        unit: "ммоль/л",
        type: "number" as const,
        reference_ranges: {
          men: { min: 3.3, max: 5.5 },
          women: { min: 3.3, max: 5.5 },
          children: { min: 3.3, max: 5.5 }
        },
        is_required: true
      },
      {
        name: "Креатинин",
        unit: "мкмоль/л",
        type: "number" as const,
        reference_ranges: {
          men: { min: 80, max: 115 },
          women: { min: 53, max: 97 },
          children: { min: 27, max: 62 }
        },
        is_required: true
      }
    ]
  },
  {
    name: "Общий анализ мочи",
    code: "OAM",
    category: "urine",
    description: "Исследование физических и химических свойств мочи",
    parameters: [
      {
        name: "Цвет",
        unit: "",
        type: "text" as const,
        is_required: true
      },
      {
        name: "Прозрачность",
        unit: "",
        type: "text" as const,
        is_required: true
      },
      {
        name: "Белок",
        unit: "г/л",
        type: "number" as const,
        reference_ranges: {
          men: { min: 0, max: 0.14 },
          women: { min: 0, max: 0.14 },
          children: { min: 0, max: 0.14 }
        },
        is_required: false
      }
    ]
  }
];

export function CreateAnalysisTemplateEnhanced({ onSuccess, onCancel }: CreateAnalysisTemplateEnhancedProps) {
  const [template, setTemplate] = useState<Omit<AnalysisTemplate, 'parameters'>>({
    name: "",
    code: "",
    category: "",
    description: "",
  });

  const [parameters, setParameters] = useState<AnalysisParameter[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

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

  const updateReferenceRange = (id: string, group: 'men' | 'women' | 'children', field: 'min' | 'max', value: number | undefined) => {
    setParameters(parameters.map(param => {
      if (param.id === id) {
        const updatedRanges = { ...param.reference_ranges };
        if (!updatedRanges[group]) {
          updatedRanges[group] = {};
        }
        updatedRanges[group] = { ...updatedRanges[group], [field]: value };
        return { ...param, reference_ranges: updatedRanges };
      }
      return param;
    }));
  };

  const removeParameter = (id: string) => {
    setParameters(parameters.filter(param => param.id !== id));
  };

  const duplicateParameter = (id: string) => {
    const param = parameters.find(p => p.id === id);
    if (param) {
      const newParam = { 
        ...param, 
        id: Date.now().toString(),
        name: `${param.name} (копия)`
      };
      setParameters([...parameters, newParam]);
    }
  };

  const loadPreset = (presetName: string) => {
    const preset = PRESET_TEMPLATES.find(p => p.name === presetName);
    if (preset) {
      setTemplate({
        name: preset.name,
        code: preset.code,
        category: preset.category,
        description: preset.description,
      });
      
      const newParameters = preset.parameters.map((param, index) => ({
        ...param,
        id: (Date.now() + index).toString(),
      }));
      setParameters(newParameters);
    }
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
    <div className="space-y-6">
      {/* Быстрые шаблоны */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Быстрое создание
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPreset(preset.name);
                  loadPreset(preset.name);
                }}
                className={selectedPreset === preset.name ? "border-primary" : ""}
              >
                <Copy className="h-3 w-3 mr-1" />
                {preset.name}
              </Button>
            ))}
          </div>
          {selectedPreset && (
            <p className="text-sm text-muted-foreground mt-2">
              Загружен шаблон "{selectedPreset}". Вы можете изменить его по необходимости.
            </p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
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
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Нет параметров. Добавьте параметры для анализа.
                </p>
                <Button type="button" variant="outline" onClick={addParameter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить первый параметр
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {parameters.map((parameter, index) => (
                  <Card key={parameter.id} className="p-4">
                    <div className="space-y-4">
                      {/* Основная информация о параметре */}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Параметр {index + 1}</Badge>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateParameter(parameter.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeParameter(parameter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Название *</Label>
                          <Input
                            value={parameter.name}
                            onChange={(e) => updateParameter(parameter.id, 'name', e.target.value)}
                            placeholder="Гемоглобин"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Единица</Label>
                          <Input
                            value={parameter.unit}
                            onChange={(e) => updateParameter(parameter.id, 'unit', e.target.value)}
                            placeholder="г/л"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Тип данных</Label>
                          <Select
                            value={parameter.type}
                            onValueChange={(value: "number" | "text" | "boolean") => 
                              updateParameter(parameter.id, 'type', value)
                            }
                          >
                            <SelectTrigger>
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
                        </div>
                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${parameter.id}`}
                              checked={parameter.is_required}
                              onCheckedChange={(checked) => 
                                updateParameter(parameter.id, 'is_required', checked)
                              }
                            />
                            <Label htmlFor={`required-${parameter.id}`}>
                              Обязательно
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Референсные значения */}
                      {parameter.type === "number" && (
                        <div className="border-t pt-4">
                          <Label className="text-sm font-medium mb-3 block">
                            Референсные значения по группам
                          </Label>
                          <Tabs defaultValue="men" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="men" className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Мужчины
                              </TabsTrigger>
                              <TabsTrigger value="women" className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Женщины
                              </TabsTrigger>
                              <TabsTrigger value="children" className="flex items-center gap-2">
                                <Baby className="h-3 w-3" />
                                Дети
                              </TabsTrigger>
                            </TabsList>
                            
                            {["men", "women", "children"].map((group) => (
                              <TabsContent key={group} value={group} className="mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Минимум</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={parameter.reference_ranges?.[group as keyof typeof parameter.reference_ranges]?.min || ""}
                                      onChange={(e) => 
                                        updateReferenceRange(
                                          parameter.id, 
                                          group as 'men' | 'women' | 'children', 
                                          'min', 
                                          e.target.value ? parseFloat(e.target.value) : undefined
                                        )
                                      }
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Максимум</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={parameter.reference_ranges?.[group as keyof typeof parameter.reference_ranges]?.max || ""}
                                      onChange={(e) => 
                                        updateReferenceRange(
                                          parameter.id, 
                                          group as 'men' | 'women' | 'children', 
                                          'max', 
                                          e.target.value ? parseFloat(e.target.value) : undefined
                                        )
                                      }
                                      placeholder="100"
                                    />
                                  </div>
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" className="min-w-[120px]">
            Сохранить шаблон
          </Button>
        </div>
      </form>
    </div>
  );
}
