"use client";

import { useEffect, useState } from "react";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PERMISSION_LABELS,
  PERMISSION_DESCRIPTIONS,
  getAllPermissions,
} from "@/constants/permissions.constants";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/features/roles/role.types";

type RoleSheetOwnProps = {
  role?: Role;
  onSubmit: (data: CreateRoleDto | UpdateRoleDto) => void;
  isLoading?: boolean;
};

type RoleSheetProps = RoleSheetOwnProps & DialogProps;

export const RoleSheet = ({
  open,
  onOpenChange,
  role,
  onSubmit,
  isLoading,
}: RoleSheetProps) => {
  const isEdit = !!role;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Initialize form when role changes
  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description ?? "");
      setIsActive(role.isActive);
      setSelectedPermissions(role.permissions?.map((p) => p.permission) ?? []);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setSelectedPermissions([]);
    }
  }, [role, open]);

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permission]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== permission));
    }
  };

  const handleSelectAll = () => {
    const allPermissions = getAllPermissions();
    if (selectedPermissions.length === allPermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      isActive,
      permissions: selectedPermissions,
    });
  };

  const allPermissions = getAllPermissions();
  const allSelected = selectedPermissions.length === allPermissions.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Редактировать роль" : "Новая роль"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Измените настройки роли и права доступа"
              : "Создайте новую роль и назначьте права доступа"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <SheetBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Врач-терапевт"
                  disabled={role?.isSystem}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите назначение роли..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Активная</Label>
                  <p className="text-sm text-muted-foreground">
                    Неактивные роли не назначаются пользователям
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Label>Права доступа</Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {allSelected ? "Снять все" : "Выбрать все"}
                </Button>
              </div>

              <div className="space-y-3">
                {allPermissions.map((permission) => {
                  const isChecked = selectedPermissions.includes(permission);
                  return (
                    <div
                      key={permission}
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-lg transition-colors border border-transparent",
                        isChecked
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        id={permission}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handlePermissionToggle(permission, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <label
                          htmlFor={permission}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {PERMISSION_LABELS[permission]}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {PERMISSION_DESCRIPTIONS[permission]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Выбрано: {selectedPermissions.length} из {allPermissions.length}
              </p>
            </div>
          </SheetBody>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Сохранить" : "Создать"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
