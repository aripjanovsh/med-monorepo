"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { Role, UpdateRoleDto } from "@/features/roles/role.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  useGetRoleQuery,
  useGetGroupedPermissionsQuery,
  useUpdateRoleMutation,
} from "@/features/roles/role.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editedRole, setEditedRole] = useState<Partial<Role>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: role, isLoading, error } = useGetRoleQuery(roleId);
  const { data: groupedPermissions, isLoading: isLoadingPermissions } =
    useGetGroupedPermissionsQuery();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  // Initialize edit state when role loads (only once)
  useEffect(() => {
    if (role) {
      // Use permissionId instead of RolePermission.id
      const permissionIds =
        role.permissions?.map((p) => (p as any).permissionId) || [];

      setEditedRole({
        name: role.name,
        description: role.description,
        isActive: role.isActive,
      });
      setSelectedPermissions(permissionIds);
    }
  }, [role]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (role) {
      setEditedRole({
        name: role.name,
        description: role.description,
        isActive: role.isActive,
      });
      setSelectedPermissions(
        role.permissions?.map((p) => (p as any).permissionId) || []
      );
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!role) return;

    try {
      const updateData: UpdateRoleDto = {
        name: editedRole.name,
        description: editedRole.description,
        isActive: editedRole.isActive,
        permissionIds: selectedPermissions,
      };

      await updateRole({
        id: role.id,
        data: updateData,
      }).unwrap();

      toast.success("Role updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedPermissions, permissionId];
    } else {
      newSelected = selectedPermissions.filter((id) => id !== permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleResourceToggle = (
    resourcePermissions: string[],
    checked: boolean
  ) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [
        ...new Set([...selectedPermissions, ...resourcePermissions]),
      ];
    } else {
      newSelected = selectedPermissions.filter(
        (id) => !resourcePermissions.includes(id)
      );
    }
    setSelectedPermissions(newSelected);
  };

  const isResourceChecked = (resourcePermissions: string[]) => {
    return resourcePermissions.every((id) => selectedPermissions.includes(id));
  };

  const isResourceIndeterminate = (resourcePermissions: string[]) => {
    const selectedInResource = resourcePermissions.filter((id) =>
      selectedPermissions.includes(id)
    );
    return (
      selectedInResource.length > 0 &&
      selectedInResource.length < resourcePermissions.length
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Role not found</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold font-gilroy">
                {isEditing ? (
                  <Input
                    value={editedRole.name || ""}
                    onChange={(e) =>
                      setEditedRole((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="text-2xl font-bold border-none p-0 h-auto"
                  />
                ) : (
                  role.name
                )}
              </h1>
              {role.isSystem && <Badge variant="secondary">System</Badge>}
            </div>
            <p className="text-muted-foreground">
              {isEditing ? (
                <Textarea
                  value={editedRole.description || ""}
                  onChange={(e) =>
                    setEditedRole((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Role description"
                  className="mt-1 resize-none"
                />
              ) : (
                role.description || "No description"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </>
          ) : (
            !role.isSystem && (
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editedRole.isActive ?? role.isActive}
                        onCheckedChange={(checked) =>
                          setEditedRole((prev) => ({
                            ...prev,
                            isActive: checked,
                          }))
                        }
                      />
                      <span className="text-sm">
                        {editedRole.isActive ?? role.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  ) : (
                    <Badge variant={role.isActive ? "default" : "secondary"}>
                      {role.isActive ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Type
                </label>
                <div className="mt-1">
                  <Badge variant={role.isSystem ? "destructive" : "outline"}>
                    {role.isSystem ? "System Role" : "Custom Role"}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="mt-1 text-sm">
                  {new Date(role.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="mt-1 text-sm">
                  {new Date(role.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Permissions Count
                </label>
                <p className="mt-1 text-sm">
                  {selectedPermissions.length} permission
                  {selectedPermissions.length !== 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPermissions ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedPermissions &&
                    Object.entries(groupedPermissions).map(
                      ([resource, permissions]) => {
                        const resourcePermissionIds = permissions.map(
                          (p) => p.id
                        );
                        const isChecked = isResourceChecked(
                          resourcePermissionIds
                        );
                        const isIndeterminate = isResourceIndeterminate(
                          resourcePermissionIds
                        );

                        return (
                          <div key={resource} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`resource-${resource}`}
                                checked={isChecked}
                                disabled={!isEditing}
                                ref={(ref) => {
                                  if (ref && ref.querySelector) {
                                    const input = ref.querySelector("input");
                                    if (input)
                                      input.indeterminate = isIndeterminate;
                                  }
                                }}
                                onCheckedChange={(checked) =>
                                  handleResourceToggle(
                                    resourcePermissionIds,
                                    checked as boolean
                                  )
                                }
                              />
                              <label
                                htmlFor={`resource-${resource}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                              >
                                {resource}
                              </label>
                            </div>
                            <div className="ml-6 space-y-2">
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={permission.id}
                                    checked={selectedPermissions.includes(
                                      permission.id
                                    )}
                                    disabled={!isEditing}
                                    onCheckedChange={(checked) =>
                                      handlePermissionToggle(
                                        permission.id,
                                        checked as boolean
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={permission.id}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {permission.action} -{" "}
                                    {permission.description || permission.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <Separator />
                          </div>
                        );
                      }
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
