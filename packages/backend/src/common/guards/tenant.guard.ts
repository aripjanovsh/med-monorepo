import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TenantService } from "../tenant/tenant.service";
import { UserRole } from "@prisma/client";

export const RequireTenant = Reflector.createDecorator<boolean>();

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requireTenant = this.reflector.getAllAndOverride<boolean>(
      RequireTenant,
      [context.getHandler(), context.getClass()]
    );

    // If tenant is not required, allow access
    if (!requireTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admin can bypass tenant restrictions
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    if (isSuperAdmin) {
      request.isSuperAdmin = true;
      return true;
    }

    // Set organization ID from user for regular users
    if (user?.organizationId) {
      this.tenantService.setOrganizationId(user.organizationId);
      return true;
    }

    // Regular users must have organization ID
    throw new ForbiddenException(
      "Organization context is required for this operation"
    );
  }
}
