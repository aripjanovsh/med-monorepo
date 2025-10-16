import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "@prisma/client";

export const RoleAll = () =>
  SetMetadata(ROLES_KEY, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
