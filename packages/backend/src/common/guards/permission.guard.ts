import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleService } from "../../modules/role/role.service";

export const RequirePermission = Reflector.createDecorator<{
  resource: string;
  action: string;
}>();

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly roleService: RoleService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>(RequirePermission, [context.getHandler(), context.getClass()]);

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
      requiredPermission.resource,
      requiredPermission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permission: ${requiredPermission.action} on ${requiredPermission.resource}`,
      );
    }

    return true;
  }
}
