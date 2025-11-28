"use client";

import { useState } from "react";
import {
  Plus,
  Users,
  Shield,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleFilters,
} from "@/features/roles/role.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleSheet } from "@/features/roles/components/role-sheet";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/features/roles/role.api";
import { toast } from "sonner";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";
import { PERMISSION_LABELS } from "@/constants/permissions.constants";

export default function RolesPage() {
  const roleSheet = useDialog(RoleSheet);
  const confirm = useConfirmDialog();

  const [filters] = useState<RoleFilters>({
    page: 1,
    limit: 50,
    includeInactive: true,
  });

  const { data: rolesResponse, isLoading } = useGetRolesQuery(filters);
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const handleCreateRole = () => {
    roleSheet.open({
      onSubmit: async (data) => {
        try {
          await createRole(data as CreateRoleDto).unwrap();
          toast.success("Роль создана");
          roleSheet.close();
        } catch {
          toast.error("Не удалось создать роль");
        }
      },
      isLoading: isCreating,
    });
  };

  const handleEditRole = (role: Role) => {
    roleSheet.open({
      role,
      onSubmit: async (data: UpdateRoleDto) => {
        try {
          await updateRole({ id: role.id, data }).unwrap();
          toast.success("Роль обновлена");
          roleSheet.close();
        } catch {
          toast.error("Не удалось обновить роль");
        }
      },
      isLoading: isUpdating,
    });
  };

  const handleDeleteRole = (role: Role) => {
    confirm({
      title: "Удалить роль?",
      description: `Роль "${role.name}" будет удалена. Это действие нельзя отменить.`,
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: async () => {
        try {
          await deleteRole(role.id).unwrap();
          toast.success("Роль удалена");
        } catch {
          toast.error("Не удалось удалить роль");
        }
      },
    });
  };

  const roles = rolesResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-gilroy">Роли</h1>
          <p className="text-muted-foreground">
            Управление ролями и правами доступа
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Новая роль
        </Button>
      </div>

      {roles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Нет ролей</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Создайте первую роль для управления доступом
            </p>
            <Button onClick={handleCreateRole}>
              <Plus className="mr-2 h-4 w-4" />
              Создать роль
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={!role.isActive ? "opacity-60" : undefined}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          Системная
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {role.description || "Без описания"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditRole(role)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      {!role.isSystem && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {role._count?.userAssignments ?? 0} пользователей
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{role.permissions?.length ?? 0} прав доступа</span>
                  </div>

                  {role.permissions && role.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {role.permissions.slice(0, 3).map((p) => (
                        <Badge key={p.id} variant="outline" className="text-xs">
                          {PERMISSION_LABELS[
                            p.permission as keyof typeof PERMISSION_LABELS
                          ] ?? p.permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {!role.isActive && (
                    <Badge variant="secondary" className="mt-2">
                      Неактивна
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
