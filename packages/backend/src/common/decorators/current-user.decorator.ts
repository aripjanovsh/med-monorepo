import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export type CurrentUserData = {
  id: string;
  phone: string;
  /** Dynamic role names from Role table */
  roles: string[];
  /** All permission names from user's roles */
  permissions: string[];
  organizationId?: string;
  /** Employee ID for audit fields (createdById, updatedById, etc.) */
  employeeId?: string;
  isActive: boolean;
  /** System-level super admin flag */
  isSuperAdmin: boolean;
};

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      roles: user.roles ?? [],
      permissions: user.permissions ?? [],
      organizationId: user.organizationId,
      employeeId: user.employeeId,
      isActive: user.isActive ?? true,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN,
    };
  }
);
