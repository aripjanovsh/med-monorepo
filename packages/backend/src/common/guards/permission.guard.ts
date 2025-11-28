import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleService } from "../../modules/role/role.service";
import { PermissionName } from "../constants/permissions.constants";

// Support both old format { resource, action } and new format PermissionName
type PermissionRequirement =
  | PermissionName
  | { resource: string; action: string };

export const RequirePermission =
  Reflector.createDecorator<PermissionRequirement>();

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly roleService: RoleService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<PermissionName>(
      RequirePermission,
      [context.getHandler(), context.getClass()]
    );

    return true; // TODO: remove this after MVP

    // If no permission is required, allow access
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException("User not authenticated");
    }

    // Check if user has the required permission
    const hasPermission = await this.roleService.checkUserPermission(
      user.userId,
      requiredPermission
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permission: ${requiredPermission}`
      );
    }

    return true;
  }
}
