"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type WidgetDefinition = {
  id: string;
  label: string;
  component: React.ReactNode;
  defaultVisible?: boolean;
};

export type DashboardConfig<T extends string = string> = {
  order: T[];
  hidden: T[];
};

type DashboardContextType = {
  config: DashboardConfig;
  setConfig: React.Dispatch<React.SetStateAction<DashboardConfig>>;
  widgets: WidgetDefinition[];
};

const DashboardContext = React.createContext<DashboardContextType | null>(null);

function useDashboardContext() {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
}

export function useDashboardConfig(
  storageKey: string,
  defaultWidgets: WidgetDefinition[]
) {
  const [config, setConfig] = React.useState<DashboardConfig>(() => {
    if (typeof window === "undefined") {
      return {
        order: defaultWidgets.map((w) => w.id),
        hidden: defaultWidgets
          .filter((w) => w.defaultVisible === false)
          .map((w) => w.id),
      };
    }

    // Check if we are on the client side
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with default widgets to handle new/removed widgets
        const allIds = new Set(defaultWidgets.map((w) => w.id));
        const savedOrder = parsed.order || [];
        const savedHidden = parsed.hidden || [];

        const mergedOrder = [
          ...savedOrder.filter((id: string) => allIds.has(id)),
          ...defaultWidgets
            .filter((w) => !savedOrder.includes(w.id))
            .map((w) => w.id),
        ];

        return {
          order: mergedOrder,
          hidden: savedHidden,
        };
      } catch (e) {
        console.error("Failed to parse dashboard config", e);
      }
    }
    return {
      order: defaultWidgets.map((w) => w.id),
      hidden: defaultWidgets
        .filter((w) => w.defaultVisible === false)
        .map((w) => w.id),
    };
  });

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(config));
  }, [config, storageKey]);

  return { config, setConfig };
}

interface SortableWidgetRunProps {
  id: string;
  label: string;
  isVisible: boolean;
  onToggle: (checked: boolean) => void;
}

function SortableWidgetItem({
  id,
  label,
  isVisible,
  onToggle,
}: SortableWidgetRunProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-2 shadow-sm select-none touch-none",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 text-sm font-medium">{label}</div>
      <Switch
        checked={isVisible}
        onCheckedChange={onToggle}
        aria-label={`Toggle ${label} visibility`}
      />
    </div>
  );
}

interface DashboardProviderProps {
  widgets: WidgetDefinition[];
  storageKey: string;
  children: React.ReactNode;
}

export function DashboardProvider({
  widgets,
  storageKey,
  children,
}: DashboardProviderProps) {
  const { config, setConfig } = useDashboardConfig(storageKey, widgets);

  const value = React.useMemo(
    () => ({
      config,
      setConfig,
      widgets,
    }),
    [config, widgets]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function DashboardTrigger() {
  const { config, setConfig, widgets } = useDashboardContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setConfig((prev) => {
        const oldIndex = prev.order.indexOf(active.id as string);
        const newIndex = prev.order.indexOf(over.id as string);

        return {
          ...prev,
          order: arrayMove(prev.order, oldIndex, newIndex),
        };
      });
    }
  };

  const handleToggle = (id: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      hidden: checked
        ? prev.hidden.filter((hiddenId) => hiddenId !== id)
        : [...prev.hidden, id],
    }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Настроить</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Настройки отображения</h4>
            <p className="text-xs text-muted-foreground">
              Перетаскивайте элементы для изменения порядка и скрывайте
              ненужные.
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={config.order}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {config.order.map((id) => {
                  const widget = widgets.find((w) => w.id === id);
                  if (!widget) return null;

                  return (
                    <SortableWidgetItem
                      key={id}
                      id={id}
                      label={widget.label}
                      isVisible={!config.hidden.includes(id)}
                      onToggle={(checked) => handleToggle(id, checked)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DashboardContent({ className }: { className?: string }) {
  const { config, widgets } = useDashboardContext();

  const sortedWidgets = React.useMemo(() => {
    const widgetsMap = new Map(widgets.map((w) => [w.id, w]));
    return config.order
      .map((id) => {
        const widget = widgetsMap.get(id);
        if (!widget || config.hidden.includes(id)) return null;
        return <React.Fragment key={id}>{widget.component}</React.Fragment>;
      })
      .filter(Boolean);
  }, [config.order, config.hidden, widgets]);

  return <div className={className}>{sortedWidgets}</div>;
}
