"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Role, CreateRoleDto, RoleFilters } from "@/features/roles/role.types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { createRoleColumns } from "@/components/roles/role-columns";
import { RoleSheet } from "@/components/roles/role-sheet";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
} from "@/features/roles/role.api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function RolesPage() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | undefined>();

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
    setSheetOpen(true);
  };

  const handleViewRole = (role: Role) => {
    router.push(`/cabinet/settings/roles/${role.id}`);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateRoleDto) => {
    try {
      const newRole = await createRole(data).unwrap();
      toast.success("Role created successfully");
      setSheetOpen(false);
      // Redirect to role detail page to add permissions
      router.push(`/cabinet/settings/roles/${newRole.id}`);
    } catch (error) {
      toast.error("Failed to create role");
    }
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.id).unwrap();
      toast.success("Role deleted successfully");
      setDeleteDialogOpen(false);
      setRoleToDelete(undefined);
    } catch (error) {
      toast.error("Failed to delete role");
    }
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

      <RoleSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              role &ldquo;{roleToDelete?.name}&rdquo; and remove it from all
              users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
