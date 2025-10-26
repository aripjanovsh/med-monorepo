"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { OrderStatus, PaymentStatus } from "../service-order.dto";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "../service-order.constants";

export interface ServiceOrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  serviceType?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  departmentId?: string;
}

interface ServiceOrderFiltersProps {
  filters: ServiceOrderFilters;
  onFiltersChange: (filters: ServiceOrderFilters) => void;
  onReset: () => void;
}

export const ServiceOrderFiltersComponent = ({
  filters,
  onFiltersChange,
  onReset,
}: ServiceOrderFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.status ||
    filters.paymentStatus ||
    filters.serviceType ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  const handleFilterChange = (key: keyof ServiceOrderFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "ALL" ? undefined : value || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Поиск по услуге или пациенту..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="max-w-md"
        />

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Фильтры
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  •
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Фильтры</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-auto p-1 text-xs"
                  >
                    Сбросить
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Статус заказа</Label>
                  <Select
                    value={filters.status || "ALL"}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все статусы</SelectItem>
                      {Object.entries(ORDER_STATUS_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Статус оплаты</Label>
                  <Select
                    value={filters.paymentStatus || "ALL"}
                    onValueChange={(value) =>
                      handleFilterChange("paymentStatus", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все статусы</SelectItem>
                      {Object.entries(PAYMENT_STATUS_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Тип услуги</Label>
                  <Select
                    value={filters.serviceType || "ALL"}
                    onValueChange={(value) =>
                      handleFilterChange("serviceType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все типы</SelectItem>
                      {Object.entries(SERVICE_TYPE_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Дата от</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {filters.dateFrom
                            ? format(filters.dateFrom, "dd.MM.yyyy", {
                                locale: ru,
                              })
                            : "Выберите"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date) =>
                            handleFilterChange("dateFrom", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Дата до</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {filters.dateTo
                            ? format(filters.dateTo, "dd.MM.yyyy", {
                                locale: ru,
                              })
                            : "Выберите"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date) => handleFilterChange("dateTo", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Сбросить
          </Button>
        )}
      </div>
    </div>
  );
};
