"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  GroupedPermissions,
} from "@/features/roles/role.types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetGroupedPermissionsQuery } from "@/store/api/role.api";
import { Loader2 } from "lucide-react";

const roleSchema = z.object({
  name: z.string().min(2, {
    message: "Role name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: CreateRoleDto | UpdateRoleDto) => void;
  isLoading?: boolean;
}

export function RoleForm({ role, onSubmit, isLoading }: RoleFormProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: groupedPermissions, isLoading: isLoadingPermissions } =
    useGetGroupedPermissionsQuery();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      isActive: role?.isActive ?? true,
      permissionIds: role?.permissions?.map((p) => p.id) || [],
    },
  });

  useEffect(() => {
    if (role?.permissions) {
      const permissionIds = role.permissions.map((p) => p.id);
      setSelectedPermissions(permissionIds);
      form.setValue("permissionIds", permissionIds);
    }
  }, [role, form]);

  const handleSubmit = (values: RoleFormValues) => {
    const data = {
      ...values,
      permissionIds: selectedPermissions,
    };
    onSubmit(data);
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedPermissions, permissionId];
    } else {
      newSelected = selectedPermissions.filter((id) => id !== permissionId);
    }
    setSelectedPermissions(newSelected);
    form.setValue("permissionIds", newSelected);
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
    form.setValue("permissionIds", newSelected);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter role name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter role description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this role
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div>
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
                  <ScrollArea className="h-96">
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
                                    ref={(ref) => {
                                      if (ref && ref.querySelector) {
                                        const input =
                                          ref.querySelector("input");
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
                                        {permission.description ||
                                          permission.name}
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
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {role ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
