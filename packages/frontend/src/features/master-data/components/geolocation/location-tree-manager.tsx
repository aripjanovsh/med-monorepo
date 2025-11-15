"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Globe,
  MapPin,
  Building,
  Navigation,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useGetLocationTreeQuery,
  useToggleLocationStatusMutation,
  useDeleteLocationMutation,
} from "@/features/master-data";
import type { LocationTreeNode, LocationType } from "@/features/master-data";
import { LocationForm } from "./location-form";
import { toast } from "sonner";

interface FormState {
  open: boolean;
  mode: "create" | "edit";
  location?: LocationTreeNode;
  parentId?: string;
}

// Иконки и цвета для типов локаций
const LOCATION_CONFIG = {
  COUNTRY: { icon: Globe, color: "text-blue-600", label: "Страна" },
  REGION: { icon: MapPin, color: "text-green-600", label: "Регион" },
  CITY: { icon: Building, color: "text-purple-600", label: "Город" },
  DISTRICT: { icon: Navigation, color: "text-orange-600", label: "Район" },
} as const;

export function LocationTreeManager() {
  const [search, setSearch] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<FormState>({ open: false, mode: "create" });

  // API hooks
  const { data: treeData = [], isLoading } = useGetLocationTreeQuery();
  const [toggleStatus] = useToggleLocationStatusMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  // Утилиты
  const toggleExpanded = (nodeId: string) => {
    setExpanded((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const closeForm = () => setForm({ open: false, mode: "create" });

  // Обработчики действий
  const handleCreate = (parentId?: string) => {
    setForm({ open: true, mode: "create", parentId });
  };

  const handleEdit = (location: LocationTreeNode) => {
    setForm({ open: true, mode: "edit", location });
  };

  const handleToggleStatus = async (location: LocationTreeNode) => {
    try {
      await toggleStatus(location.id).unwrap();
      toast.success(`Статус "${location.name}" обновлен`);
    } catch (error) {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const handleDelete = async (location: LocationTreeNode) => {
    if (!confirm(`Удалить "${location.name}"?`)) return;

    try {
      await deleteLocation(location.id).unwrap();
      toast.success(`"${location.name}" удален`);
    } catch (error) {
      toast.error("Ошибка при удалении");
    }
  };

  // Фильтрация дерева (рекурсивно)
  const filterTree = (nodes: LocationTreeNode[]): LocationTreeNode[] => {
    return nodes
      .filter((node) => {
        const matchesSearch =
          !search ||
          node.name.toLowerCase().includes(search.toLowerCase()) ||
          node.code?.toLowerCase().includes(search.toLowerCase());

        const matchesActive = !showActiveOnly || node.isActive;

        // Если узел не проходит фильтр, но у него есть дети, проверяем детей
        if (!matchesSearch || !matchesActive) {
          if (node.children?.length) {
            const filteredChildren = filterTree(node.children);
            if (filteredChildren.length > 0) {
              return true; // Показываем родителя, если есть подходящие дети
            }
          }
          return false;
        }
        return true;
      })
      .map((node) => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined,
      }));
  };

  // Рендер узла дерева
  const renderNode = (
    node: LocationTreeNode,
    level: number = 0,
  ): React.ReactNode => {
    const isExpanded = expanded[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const config = LOCATION_CONFIG[node.type];
    const Icon = config.icon;

    return (
      <div key={node.id} className="select-none">
        {/* Основная строка узла */}
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group transition-colors",
            !node.isActive && "opacity-60",
          )}
          style={{ marginLeft: `${level * 20}px` }} // Динамический отступ
        >
          {/* Кнопка разворота */}
          <div className="w-5 flex justify-center">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-gray-200 rounded-sm"
                onClick={() => toggleExpanded(node.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>

          {/* Иконка типа */}
          <Icon className={cn("h-4 w-4", config.color)} />

          {/* Информация о локации */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900 truncate">
                {node.name}
              </span>

              {node.code && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {node.code}
                </Badge>
              )}

              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {config.label}
              </Badge>

              {!node.isActive && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Неактивно
                </Badge>
              )}
            </div>
          </div>

          {/* Быстрое добавление */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleCreate(node.id)}
            title="Добавить дочернюю локацию"
          >
            <Plus className="h-3 w-3" />
          </Button>

          {/* Меню действий */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleEdit(node)}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(node)}>
                {node.isActive ? (
                  <>
                    <ToggleLeft className="h-4 w-4 mr-2" />
                    Деактивировать
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4 mr-2" />
                    Активировать
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(node)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Дочерние узлы */}
        {hasChildren && isExpanded && (
          <div>
            {node.children?.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filteredData = filterTree(treeData);

  return (
    <div className="space-y-4">
      {/* Панель управления */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по названию или коду..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={showActiveOnly}
            onCheckedChange={setShowActiveOnly}
            id="active-only"
          />
          <label
            htmlFor="active-only"
            className="text-sm text-gray-600 whitespace-nowrap"
          >
            Только активные
          </label>
        </div>

        <Button onClick={() => handleCreate()}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить локацию
        </Button>
      </div>

      {/* Дерево локаций */}
      <div className="border rounded-lg bg-white">
        {filteredData.length > 0 ? (
          <div className="p-2 space-y-1">
            {filteredData.map((node) => renderNode(node))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Локации не найдены</p>
            <p className="text-sm mt-1">
              {search || showActiveOnly
                ? "Попробуйте изменить условия поиска"
                : "Начните с создания первой локации"}
            </p>
          </div>
        )}
      </div>

      {/* Форма создания/редактирования */}
      <LocationForm
        open={form.open}
        onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        mode={form.mode}
        location={form.location}
        parentId={form.parentId}
        onSuccess={() => {
          closeForm();
          toast.success(
            form.mode === "create" ? "Локация создана" : "Локация обновлена",
          );
        }}
      />
    </div>
  );
}
