"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Trash2 } from "lucide-react";

interface AnalysisTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  parameters: Array<{
    name: string;
    unit: string;
    type: "number" | "text" | "boolean";
    ref_min?: number;
    ref_max?: number;
    is_required: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

// Моковые данные для демонстрации
const mockTemplates: AnalysisTemplate[] = [
  {
    id: "1",
    name: "Общий анализ крови",
    code: "OAK-001",
    category: "blood",
    description: "Базовый анализ для оценки общего состояния здоровья",
    parameters: [
      {
        name: "Гемоглобин",
        unit: "г/л",
        type: "number",
        ref_min: 120,
        ref_max: 160,
        is_required: true,
      },
      {
        name: "Эритроциты",
        unit: "×10¹²/л",
        type: "number",
        ref_min: 4.0,
        ref_max: 5.5,
        is_required: true,
      },
      {
        name: "Лейкоциты",
        unit: "×10⁹/л",
        type: "number",
        ref_min: 4.0,
        ref_max: 9.0,
        is_required: true,
      },
    ],
    created_at: "2024-01-15",
    updated_at: "2024-01-20",
  },
  {
    id: "2",
    name: "Анализ мочи общий",
    code: "OAM-001",
    category: "urine",
    description: "Исследование физических и химических свойств мочи",
    parameters: [
      {
        name: "Цвет",
        unit: "",
        type: "text",
        is_required: true,
      },
      {
        name: "Прозрачность",
        unit: "",
        type: "text",
        is_required: true,
      },
      {
        name: "Белок",
        unit: "г/л",
        type: "number",
        ref_min: 0,
        ref_max: 0.14,
        is_required: false,
      },
    ],
    created_at: "2024-01-10",
    updated_at: "2024-01-18",
  },
  {
    id: "3",
    name: "Биохимия крови базовая",
    code: "BIO-001",
    category: "biochemistry",
    description: "Основные биохимические показатели крови",
    parameters: [
      {
        name: "Глюкоза",
        unit: "ммоль/л",
        type: "number",
        ref_min: 3.3,
        ref_max: 5.5,
        is_required: true,
      },
      {
        name: "Креатинин",
        unit: "мкмоль/л",
        type: "number",
        ref_min: 62,
        ref_max: 115,
        is_required: true,
      },
    ],
    created_at: "2024-01-08",
    updated_at: "2024-01-22",
  },
];

const categories = [
  { value: "all", label: "Все категории" },
  { value: "blood", label: "Кровь" },
  { value: "urine", label: "Моча" },
  { value: "biochemistry", label: "Биохимия" },
  { value: "other", label: "Другое" },
];

const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    blood: "Кровь",
    urine: "Моча",
    biochemistry: "Биохимия",
    other: "Другое",
  };
  return categoryMap[category] || category;
};

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    number: "Число",
    text: "Текст",
    boolean: "Да/Нет",
  };
  return typeMap[type] || type;
};

export function AnalysisTemplatesList() {
  const [templates] = useState<AnalysisTemplate[]>(mockTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<AnalysisTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterTemplates(term, selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterTemplates(searchTerm, category);
  };

  const filterTemplates = (term: string, category: string) => {
    let filtered = templates;

    if (term) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(term.toLowerCase()) ||
          template.code.toLowerCase().includes(term.toLowerCase()) ||
          template.description.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (category !== "all") {
      filtered = filtered.filter((template) => template.category === category);
    }

    setFilteredTemplates(filtered);
  };

  const toggleExpanded = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, коду или описанию..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>
        </CardContent>
      </Card>

      {/* Список шаблонов */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Шаблоны не найдены. Попробуйте изменить критерии поиска.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">
                      {getCategoryLabel(template.category)}
                    </Badge>
                    <Badge variant="outline">{template.code}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(template.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {expandedTemplate === template.id ? "Скрыть" : "Просмотр"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                  </div>
                </div>
                {template.description && (
                  <p className="text-muted-foreground text-sm">
                    {template.description}
                  </p>
                )}
              </CardHeader>

              {expandedTemplate === template.id && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        Параметры анализа ({template.parameters.length})
                      </h4>
                      <div className="space-y-2">
                        {template.parameters.map((parameter, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {parameter.name}
                                </span>
                                {parameter.unit && (
                                  <Badge variant="outline" className="text-xs">
                                    {parameter.unit}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {getTypeLabel(parameter.type)}
                                </Badge>
                                {parameter.is_required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Обязательно
                                  </Badge>
                                )}
                              </div>
                              {parameter.type === "number" &&
                                (parameter.ref_min !== undefined ||
                                  parameter.ref_max !== undefined) && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Норма: {parameter.ref_min || "—"} -{" "}
                                    {parameter.ref_max || "—"}
                                    {parameter.unit && ` ${parameter.unit}`}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-4">
                      <div className="flex justify-between">
                        <span>Создано: {template.created_at}</span>
                        <span>Обновлено: {template.updated_at}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
