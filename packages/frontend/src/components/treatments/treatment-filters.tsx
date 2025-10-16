"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TreatmentFilter } from "@/types/treatment";

interface TreatmentFiltersProps {
  filters: TreatmentFilter;
  onFiltersChange: (filters: TreatmentFilter) => void;
  onReset: () => void;
}

export function TreatmentFilters({ 
  filters, 
  onFiltersChange, 
  onReset 
}: TreatmentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TreatmentFilter>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const updateFilter = (key: keyof TreatmentFilter, value: any) => {
    setLocalFilters({
      ...localFilters,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <Label>Категория</Label>
          <Select
            value={localFilters.category || ""}
            onValueChange={(value) => updateFilter('category', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все категории</SelectItem>
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

        {/* Status Filter */}
        <div>
          <Label>Статус</Label>
          <Select
            value={localFilters.status || ""}
            onValueChange={(value) => updateFilter('status', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все статусы</SelectItem>
              <SelectItem value="ACTIVE">Активный</SelectItem>
              <SelectItem value="INACTIVE">Неактивный</SelectItem>
              <SelectItem value="DISCONTINUED">Прекращен</SelectItem>
              <SelectItem value="UNDER_REVIEW">На рассмотрении</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <Label>Сложность</Label>
          <Select
            value={localFilters.difficulty || ""}
            onValueChange={(value) => updateFilter('difficulty', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все уровни" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все уровни</SelectItem>
              <SelectItem value="BASIC">Базовый</SelectItem>
              <SelectItem value="INTERMEDIATE">Средний</SelectItem>
              <SelectItem value="ADVANCED">Продвинутый</SelectItem>
              <SelectItem value="EXPERT">Экспертный</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label>Диапазон цен ($)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Мин. цена"
            value={localFilters.priceRange?.min || ""}
            onChange={(e) => {
              const min = parseInt(e.target.value) || undefined;
              updateFilter('priceRange', {
                ...localFilters.priceRange,
                min
              });
            }}
          />
          <Input
            type="number"
            placeholder="Макс. цена"
            value={localFilters.priceRange?.max || ""}
            onChange={(e) => {
              const max = parseInt(e.target.value) || undefined;
              updateFilter('priceRange', {
                ...localFilters.priceRange,
                max
              });
            }}
          />
        </div>
      </div>

      {/* Duration Range */}
      <div>
        <Label>Диапазон длительности (минуты)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Мин. длительность"
            value={localFilters.durationRange?.min || ""}
            onChange={(e) => {
              const min = parseInt(e.target.value) || undefined;
              updateFilter('durationRange', {
                ...localFilters.durationRange,
                min
              });
            }}
          />
          <Input
            type="number"
            placeholder="Макс. длительность"
            value={localFilters.durationRange?.max || ""}
            onChange={(e) => {
              const max = parseInt(e.target.value) || undefined;
              updateFilter('durationRange', {
                ...localFilters.durationRange,
                max
              });
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReset}>
          Сбросить фильтры
        </Button>
        <Button onClick={handleApplyFilters}>
          Применить фильтры
        </Button>
      </div>
    </div>
  );
}