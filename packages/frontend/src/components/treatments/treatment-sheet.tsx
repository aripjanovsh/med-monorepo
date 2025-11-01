"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Clock, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";

import { Treatment, TreatmentProcedure } from "@/types/treatment";

/**
 * Пропсы для TreatmentSheet (без базовых DialogProps)
 */
type TreatmentSheetOwnProps = {
  treatment?: Treatment;
  mode: "create" | "edit";
};

/**
 * Полные пропсы с DialogProps
 */
type TreatmentSheetProps = TreatmentSheetOwnProps & DialogProps;

export function TreatmentSheet({ 
  open, 
  onOpenChange, 
  treatment, 
  mode 
}: TreatmentSheetProps) {
  const [formData, setFormData] = useState<Partial<Treatment>>({
    name: "",
    description: "",
    category: "GENERAL_DENTISTRY",
    duration: 60,
    price: 0,
    status: "ACTIVE",
    difficulty: "BASIC",
    specialization: "",
    requirements: [],
    equipmentNeeded: [],
    contraindications: [],
    sideEffects: [],
    followUpRequired: false,
    followUpDays: 0,
    preparationInstructions: "",
    postTreatmentCare: "",
    estimatedSessions: 1,
    tags: [],
    isActive: true,
    procedures: [],
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [newContraindication, setNewContraindication] = useState("");
  const [newSideEffect, setNewSideEffect] = useState("");
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (treatment && mode === "edit") {
      setFormData(treatment);
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        description: "",
        category: "GENERAL_DENTISTRY",
        duration: 60,
        price: 0,
        status: "ACTIVE",
        difficulty: "BASIC",
        specialization: "",
        requirements: [],
        equipmentNeeded: [],
        contraindications: [],
        sideEffects: [],
        followUpRequired: false,
        followUpDays: 0,
        preparationInstructions: "",
        postTreatmentCare: "",
        estimatedSessions: 1,
        tags: [],
        isActive: true,
        procedures: [],
      });
    }
  }, [treatment, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to backend
    console.log("Saving treatment:", formData);
    onOpenChange(false);
  };

  const addListItem = (field: keyof Treatment, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentList = (formData[field] as string[]) || [];
      setFormData({
        ...formData,
        [field]: [...currentList, value.trim()]
      });
      setter("");
    }
  };

  const removeListItem = (field: keyof Treatment, index: number) => {
    const currentList = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: currentList.filter((_, i) => i !== index)
    });
  };

  const addProcedure = () => {
    const newProcedure: TreatmentProcedure = {
      id: Date.now().toString(),
      step: (formData.procedures?.length || 0) + 1,
      title: "",
      description: "",
      duration: 15,
      tools: [],
    };
    
    setFormData({
      ...formData,
      procedures: [...(formData.procedures || []), newProcedure]
    });
  };

  const updateProcedure = (index: number, updates: Partial<TreatmentProcedure>) => {
    const updatedProcedures = [...(formData.procedures || [])];
    updatedProcedures[index] = { ...updatedProcedures[index], ...updates };
    setFormData({
      ...formData,
      procedures: updatedProcedures
    });
  };

  const removeProcedure = (index: number) => {
    const updatedProcedures = (formData.procedures || []).filter((_, i) => i !== index);
    // Re-number steps
    updatedProcedures.forEach((proc, i) => {
      proc.step = i + 1;
    });
    setFormData({
      ...formData,
      procedures: updatedProcedures
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Добавление новой процедуры" : `Редактирование ${treatment?.name}`}
          </SheetTitle>
          <SheetDescription>
            {mode === "create" 
              ? "Создайте новую процедуру для вашей клиники" 
              : "Измените детали и процедуры"
            }
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">Основное</TabsTrigger>
              <TabsTrigger value="details">Детали</TabsTrigger>
              <TabsTrigger value="procedures">Процедуры</TabsTrigger>
              <TabsTrigger value="care">Уход</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название процедуры *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Категория *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL_DENTISTRY">Общая стоматология</SelectItem>
                      <SelectItem value="ORTHODONTICS">Ортодонтия</SelectItem>
                      <SelectItem value="ORAL_SURGERY">Хирургия</SelectItem>
                      <SelectItem value="PERIODONTICS">Пародонтология</SelectItem>
                      <SelectItem value="ENDODONTICS">Эндодонтия</SelectItem>
                      <SelectItem value="PROSTHODONTICS">Протезирование</SelectItem>
                      <SelectItem value="PEDIATRIC_DENTISTRY">Детская стоматология</SelectItem>
                      <SelectItem value="COSMETIC_DENTISTRY">Косметическая стоматология</SelectItem>
                      <SelectItem value="PREVENTIVE_CARE">Профилактика</SelectItem>
                      <SelectItem value="EMERGENCY_CARE">Экстренная помощь</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Длительность (минуты) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Цена ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sessions">Предполагаемое количество сессий</Label>
                  <Input
                    id="sessions"
                    type="number"
                    value={formData.estimatedSessions}
                    onChange={(e) => setFormData({ ...formData, estimatedSessions: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Сложность</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Базовый</SelectItem>
                      <SelectItem value="INTERMEDIATE">Средний</SelectItem>
                      <SelectItem value="ADVANCED">Продвинутый</SelectItem>
                      <SelectItem value="EXPERT">Экспертный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Статус</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Активный</SelectItem>
                      <SelectItem value="INACTIVE">Неактивный</SelectItem>
                      <SelectItem value="UNDER_REVIEW">На рассмотрении</SelectItem>
                      <SelectItem value="DISCONTINUED">Прекращен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="specialization">Специализация</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Например, Ортодонт"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Процедура активна</Label>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Requirements */}
              <div>
                <Label>Требования</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Добавить требование..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem('requirements', newRequirement, setNewRequirement);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addListItem('requirements', newRequirement, setNewRequirement)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements?.map((req, index) => (
                      <Badge key={index} variant="secondary">
                        {req}
                        <button
                          type="button"
                          onClick={() => removeListItem('requirements', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <Label>Необходимое оборудование</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      placeholder="Добавить оборудование..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem('equipmentNeeded', newEquipment, setNewEquipment);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addListItem('equipmentNeeded', newEquipment, setNewEquipment)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipmentNeeded?.map((eq, index) => (
                      <Badge key={index} variant="secondary">
                        {eq}
                        <button
                          type="button"
                          onClick={() => removeListItem('equipmentNeeded', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Теги</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Добавить тег..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem('tags', newTag, setNewTag);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addListItem('tags', newTag, setNewTag)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeListItem('tags', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Procedures Tab */}
            <TabsContent value="procedures" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Процедуры лечения</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProcedure}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить шаг
                </Button>
              </div>

              <div className="space-y-4">
                {formData.procedures?.map((procedure, index) => (
                  <Card key={procedure.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Шаг {procedure.step}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProcedure(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Название</Label>
                        <Input
                          value={procedure.title}
                          onChange={(e) => updateProcedure(index, { title: e.target.value })}
                          placeholder="Название процедуры..."
                        />
                      </div>
                      <div>
                        <Label>Описание</Label>
                        <Textarea
                          value={procedure.description}
                          onChange={(e) => updateProcedure(index, { description: e.target.value })}
                          placeholder="Опишите процедуру..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Длительность (минуты)</Label>
                        <Input
                          type="number"
                          value={procedure.duration}
                          onChange={(e) => updateProcedure(index, { duration: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Care Instructions Tab */}
            <TabsContent value="care" className="space-y-6">
              <div>
                <Label htmlFor="prep">Инструкции по подготовке</Label>
                <Textarea
                  id="prep"
                  value={formData.preparationInstructions}
                  onChange={(e) => setFormData({ ...formData, preparationInstructions: e.target.value })}
                  placeholder="Инструкции для пациента перед лечением..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="postcare">Послеоперационный уход</Label>
                <Textarea
                  id="postcare"
                  value={formData.postTreatmentCare}
                  onChange={(e) => setFormData({ ...formData, postTreatmentCare: e.target.value })}
                  placeholder="Инструкции для пациента после лечения..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="followUp"
                    checked={formData.followUpRequired}
                    onCheckedChange={(checked) => setFormData({ ...formData, followUpRequired: checked })}
                  />
                  <Label htmlFor="followUp">Требуется повторный прием</Label>
                </div>
                {formData.followUpRequired && (
                  <div>
                    <Label htmlFor="followUpDays">Повторный прием через (дней)</Label>
                    <Input
                      id="followUpDays"
                      type="number"
                      value={formData.followUpDays}
                      onChange={(e) => setFormData({ ...formData, followUpDays: parseInt(e.target.value) || 0 })}
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              {/* Contraindications */}
              <div>
                <Label>Противопоказания</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newContraindication}
                      onChange={(e) => setNewContraindication(e.target.value)}
                      placeholder="Добавить противопоказание..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem('contraindications', newContraindication, setNewContraindication);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addListItem('contraindications', newContraindication, setNewContraindication)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.contraindications?.map((contra, index) => (
                      <Badge key={index} variant="destructive">
                        {contra}
                        <button
                          type="button"
                          onClick={() => removeListItem('contraindications', index)}
                          className="ml-2 hover:text-red-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Effects */}
              <div>
                <Label>Побочные эффекты</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newSideEffect}
                      onChange={(e) => setNewSideEffect(e.target.value)}
                      placeholder="Добавить побочный эффект..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem('sideEffects', newSideEffect, setNewSideEffect);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addListItem('sideEffects', newSideEffect, setNewSideEffect)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.sideEffects?.map((effect, index) => (
                      <Badge key={index} variant="secondary">
                        {effect}
                        <button
                          type="button"
                          onClick={() => removeListItem('sideEffects', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {mode === "create" ? "Создать процедуру" : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}