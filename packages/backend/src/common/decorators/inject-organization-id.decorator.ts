import { Transform } from "class-transformer";
import { isUUID } from "class-validator";
import { get } from "lodash";
import { RequestContextMiddleware } from "../middleware/request-context.middleware";
import { FieldErrorsException } from "../exceptions/field-errors.exception";
import type { CurrentUserData } from "./current-user.decorator";

export const InjectOrganizationId = () => {
  return Transform(({ value }: { value: unknown }) => {
    const request = RequestContextMiddleware.getRequestContext();

    const headerOrganizationId = get(
      request,
      "request.headers.x-organization-id",
      null
    );
    const user = request?.user as CurrentUserData | undefined;
    let organizationId = null;

    const isSuperAdmin = user?.isSuperAdmin ?? false;

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
