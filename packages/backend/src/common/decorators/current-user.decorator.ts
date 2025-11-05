import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export interface CurrentUserData {
  id: string;
  role: UserRole;
  phone: string;
  roles?: string[];
  organizationId?: string;
  employeeId?: string; // Employee ID for audit fields (createdById, updatedById, etc.)
  isActive: boolean;
  isSuperAdmin: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      roles: user.roles || [],
      organizationId: user.organizationId,
      employeeId: user.employeeId,
      isActive: user.isActive,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN,
    };
  },
);
