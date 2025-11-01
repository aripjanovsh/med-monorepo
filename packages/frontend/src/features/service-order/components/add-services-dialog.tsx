"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetServicesQuery } from "@/features/master-data";
import { useCreateServiceOrdersMutation } from "../service-order.api";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";

/**
 * Пропсы для AddServicesDialog (без базовых DialogProps)
 */
type AddServicesDialogOwnProps = {
  visitId: string;
  patientId: string;
  doctorId: string;
};

/**
 * Полные пропсы с DialogProps
 */
type AddServicesDialogProps = AddServicesDialogOwnProps & DialogProps;

const SERVICE_TYPE_LABELS = {
  CONSULTATION: "Консультации",
  LAB: "Лабораторные",
  DIAGNOSTIC: "Обследования",
  PROCEDURE: "Процедуры",
  OTHER: "Другое",
};

export const AddServicesDialog = ({
  open,
  onOpenChange,
  visitId,
  patientId,
  doctorId,
}: AddServicesDialogProps) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set()
  );

  const { data, isLoading } = useGetServicesQuery({
    isActive: true,
    limit: 100,
  });

  const [createOrders, { isLoading: isCreating }] =
    useCreateServiceOrdersMutation();

  const services = data?.data ?? [];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        search === "" ||
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.code?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        selectedType === "ALL" || service.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [services, search, selectedType]);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedServices.size === 0) {
      toast.error("Выберите хотя бы одну услугу");
      return;
    }

    try {
      await createOrders({
        visitId,
        patientId,
        doctorId,
        services: Array.from(selectedServices).map((serviceId) => ({
          serviceId,
        })),
      }).unwrap();

      toast.success(`Добавлено услуг: ${selectedServices.size}`);
      setSelectedServices(new Set());
      setSearch("");
      setSelectedType("ALL");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при добавлении услуг");
    }
  };

  const handleClose = () => {
    setSelectedServices(new Set());
    setSearch("");
    setSelectedType("ALL");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Добавить услуги пациенту</DialogTitle>
          <DialogDescription>
            Выберите услуги для назначения пациенту
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или коду..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="ALL">Все</TabsTrigger>
              <TabsTrigger value="CONSULTATION">Консультации</TabsTrigger>
              <TabsTrigger value="LAB">Лабораторные</TabsTrigger>
              <TabsTrigger value="DIAGNOSTIC">Обследования</TabsTrigger>
              <TabsTrigger value="PROCEDURE">Процедуры</TabsTrigger>
              <TabsTrigger value="OTHER">Другое</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Services List */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Услуги не найдены
              </div>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => toggleService(service.id)}
                  >
                    <Checkbox
                      checked={selectedServices.has(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{service.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {service.department && (
                          <Badge variant="outline" className="text-xs">
                            {service.department.name}
                          </Badge>
                        )}
                        {service.code && (
                          <span className="text-xs">{service.code}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected count */}
          {selectedServices.size > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                Выбрано услуг: {selectedServices.size}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || selectedServices.size === 0}
          >
            {isCreating
              ? "Добавление..."
              : `Добавить (${selectedServices.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
