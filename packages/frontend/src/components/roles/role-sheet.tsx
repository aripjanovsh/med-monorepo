"use client";

import { CreateRoleDto } from "@/features/roles/role.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { SimpleRoleForm } from "./simple-role-form";

interface RoleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoleDto) => void;
  isLoading?: boolean;
}

export function RoleSheet({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: RoleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create New Role</SheetTitle>
          <SheetDescription>
            Create a new role. You can add permissions after creation.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <SimpleRoleForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
