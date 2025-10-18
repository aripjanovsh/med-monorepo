import { Transform } from "class-transformer";
import { isUUID } from "class-validator";
import { get } from "lodash";
import { RequestContextMiddleware } from "../middleware/request-context.middleware";
import { FieldErrorsException } from "../exceptions/field-errors.exception";
import { CurrentUserData } from "./current-user.decorator";
import { UserRole } from "@prisma/client";

export const InjectOrganizationId = (defaultValue = undefined) => {
  return Transform(({ value }: any) => {
    const request = RequestContextMiddleware.getRequestContext();

    const headerOrganizationId = get(
      request,
      "request.headers.x-organization-id",
      null,
    );
    const user = request?.user as CurrentUserData;
    let organizationId = null;

    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

    if (isSuperAdmin && isUUID(value)) {
      organizationId = value;
    } else if (isSuperAdmin && isUUID(headerOrganizationId)) {
      organizationId = headerOrganizationId;
    } else if (!isSuperAdmin) {
      organizationId = user?.organizationId;
    }

    if (!organizationId) {
      throw new FieldErrorsException({
        organizationId: "Organization ID is required",
      });
    }

    return organizationId;
  });
};
