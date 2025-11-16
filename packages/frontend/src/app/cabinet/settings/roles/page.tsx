"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Role, CreateRoleDto, RoleFilters } from "@/features/roles/role.types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { createRoleColumns } from "@/features/roles/components/role-columns";
import { RoleSheet } from "@/features/roles/components/role-sheet";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
} from "@/features/roles/role.api";
import { toast } from "sonner";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function RolesPage() {
  const router = useRouter();
  const roleSheet = useDialog(RoleSheet);
  const confirm = useConfirmDialog();

  const [filters, setFilters] = useState<RoleFilters>({
    page: 1,
    limit: 10,
  });

  const updateFilter = (key: keyof RoleFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const {
    data: rolesResponse,
    isLoading,
    error,
  } = useGetRolesQuery({
    ...filters,
  });

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const handleCreateRole = () => {
    roleSheet.open({
      onSubmit: async (data: CreateRoleDto) => {
        try {
          const newRole = await createRole(data).unwrap();
          toast.success("Role created successfully");
          roleSheet.close();
          // Redirect to role detail page to add permissions
          router.push(`/cabinet/settings/roles/${newRole.id}`);
        } catch (error) {
          toast.error("Failed to create role");
        }
      },
      isLoading: isCreating,
    });
  };

  const handleViewRole = (role: Role) => {
    router.push(`/cabinet/settings/roles/${role.id}`);
  };

  const handleDeleteRole = (role: Role) => {
    confirm({
      title: "Удалить роль?",
      description: `Это действие нельзя отменить. Роль "${role.name}" будет удалена у всех пользователей.`,
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: async () => {
        try {
          await deleteRole(role.id).unwrap();
          toast.success("Role deleted successfully");
        } catch (error) {
          toast.error("Failed to delete role");
        }
      },
    });
  };

  const columns = createRoleColumns(handleViewRole, handleDeleteRole);

  const roles = rolesResponse?.data || [];

  return (
    <div className="flex flex-col gap-4 space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={handleCreateRole}>
          <Plus />
          Create Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        pagination={{
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: rolesResponse?.meta.total || 0,
          onChangePage: (page: number) => updateFilter("page", page),
          onChangeLimit: (limit: number) => updateFilter("limit", limit),
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
