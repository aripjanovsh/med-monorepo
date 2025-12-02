"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import {
  type SidebarBehavior,
  useSidebarSettings,
} from "@/hooks/use-sidebar-settings";

const SIDEBAR_BEHAVIOR_LABELS: Record<SidebarBehavior, string> = {
  expanded: "Развёрнуто",
  collapsed: "Свёрнуто",
};

const ThemeCard = ({
  theme,
  currentTheme,
  onSelect,
  label,
  icon: Icon,
}: {
  theme: string;
  currentTheme: string | undefined;
  onSelect: (theme: string) => void;
  label: string;
  icon: typeof Sun;
}) => {
  const isSelected = currentTheme === theme;

  return (
    <button
      type="button"
      onClick={() => onSelect(theme)}
      className={cn(
        "flex flex-col items-center gap-3 p-1 rounded-lg border-2 transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-muted-foreground/50"
      )}
    >
      <div
        className={cn(
          "w-full aspect-[4/3] rounded-md overflow-hidden",
          theme === "dark" && "bg-zinc-900",
          theme === "light" && "bg-zinc-100",
          theme === "system" && "bg-gradient-to-r from-zinc-900 to-zinc-100"
        )}
      >
        <ThemePreview theme={theme} />
      </div>
      <div className="flex items-center gap-2 pb-2">
        <RadioGroupItem value={theme} id={theme} className="sr-only" />
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
            isSelected ? "border-primary" : "border-muted-foreground/30"
          )}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <Label htmlFor={theme} className="cursor-pointer text-sm font-medium">
          {label}
        </Label>
      </div>
    </button>
  );
};

const ThemePreview = ({ theme }: { theme: string }) => {
  const isDark = theme === "dark";
  const isSystem = theme === "system";

  return (
    <div
      className={cn(
        "w-full h-full p-3 flex flex-col gap-2",
        isDark && "bg-zinc-900",
        !isDark && !isSystem && "bg-zinc-100",
        isSystem && "bg-gradient-to-r from-zinc-900 via-zinc-500 to-zinc-100"
      )}
    >
      {/* Header bar */}
      <div
        className={cn(
          "h-2 w-16 rounded-sm",
          isDark ? "bg-zinc-700" : isSystem ? "bg-zinc-400" : "bg-zinc-300"
        )}
      />
      {/* Content lines */}
      <div className="flex gap-2 flex-1">
        {/* Sidebar */}
        <div
          className={cn(
            "w-8 rounded-sm flex flex-col gap-1 p-1",
            isDark ? "bg-zinc-800" : isSystem ? "bg-zinc-400" : "bg-zinc-200"
          )}
        >
          <div
            className={cn(
              "h-1.5 w-full rounded-sm",
              isDark ? "bg-zinc-600" : isSystem ? "bg-zinc-500" : "bg-zinc-300"
            )}
          />
          <div
            className={cn(
              "h-1.5 w-full rounded-sm",
              isDark
                ? "bg-emerald-600"
                : isSystem
                  ? "bg-emerald-500"
                  : "bg-emerald-500"
            )}
          />
          <div
            className={cn(
              "h-1.5 w-full rounded-sm",
              isDark ? "bg-zinc-600" : isSystem ? "bg-zinc-500" : "bg-zinc-300"
            )}
          />
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-1">
          <div
            className={cn(
              "h-1.5 w-full rounded-sm",
              isDark ? "bg-zinc-700" : isSystem ? "bg-zinc-400" : "bg-zinc-300"
            )}
          />
          <div
            className={cn(
              "h-1.5 w-3/4 rounded-sm",
              isDark ? "bg-zinc-700" : isSystem ? "bg-zinc-400" : "bg-zinc-300"
            )}
          />
          <div
            className={cn(
              "h-1.5 w-1/2 rounded-sm",
              isDark
                ? "bg-amber-600"
                : isSystem
                  ? "bg-amber-500"
                  : "bg-amber-500"
            )}
          />
        </div>
      </div>
    </div>
  );
};

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { behavior, setBehavior, mounted } = useSidebarSettings();
  const sidebar = useSidebar();

  const handleBehaviorChange = (value: SidebarBehavior) => {
    setBehavior(value);

    // Apply the behavior immediately
    if (value === "expanded") {
      sidebar.setOpen(true);
    } else if (value === "collapsed") {
      sidebar.setOpen(false);
    }
    // "hover" behavior would need additional implementation in sidebar component
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Внешний вид</CardTitle>
        <CardDescription>Настройте внешний вид приложения</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Theme Mode */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Режим темы</h3>
            <p className="text-sm text-muted-foreground">
              Выберите как будет выглядеть приложение. Выберите тему или
              используйте системные настройки.
            </p>
          </div>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            <ThemeCard
              theme="dark"
              currentTheme={theme}
              onSelect={setTheme}
              label="Тёмная"
              icon={Moon}
            />
            <ThemeCard
              theme="light"
              currentTheme={theme}
              onSelect={setTheme}
              label="Светлая"
              icon={Sun}
            />
            <ThemeCard
              theme="system"
              currentTheme={theme}
              onSelect={setTheme}
              label="Системная"
              icon={Monitor}
            />
          </RadioGroup>
        </div>

        {/* Sidebar Behavior */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Поведение боковой панели</h3>
            <p className="text-sm text-muted-foreground">
              Выберите поведение боковой панели
            </p>
          </div>
          <Select value={behavior} onValueChange={handleBehaviorChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expanded">
                {SIDEBAR_BEHAVIOR_LABELS.expanded}
              </SelectItem>
              <SelectItem value="collapsed">
                {SIDEBAR_BEHAVIOR_LABELS.collapsed}
              </SelectItem>
              {/* <SelectItem value="hover">
                {SIDEBAR_BEHAVIOR_LABELS.hover}
              </SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
