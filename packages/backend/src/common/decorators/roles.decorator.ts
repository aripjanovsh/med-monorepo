import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "ROLES";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
