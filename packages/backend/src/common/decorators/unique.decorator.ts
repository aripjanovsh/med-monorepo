import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RequestContextService } from "../context/request-context.service";
import { RequestContextMiddleware } from "../middleware/request-context.middleware";

export interface UniqueValidationOptions {
  tableName: string;
  column: string;
  excludeField?: string; // Field name on DTO that contains the ID to exclude (legacy)
  scopeField?: string; // Field to scope the uniqueness check (e.g., organizationId)
  excludeFromRequest?: {
    source: "params" | "body" | "query" | "user";
    field: string; // field name inside the selected source
  };
}

@ValidatorConstraint({ name: "IsUnique", async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) return true; // Allow empty values, use @IsNotEmpty if required

    const options: UniqueValidationOptions = args.constraints[0];
    const object = args.object as any;

    const where: any = {
      [options.column]: value,
    };

    // Add scope condition if specified
    if (options.scopeField && object[options.scopeField]) {
      where[options.scopeField] = object[options.scopeField];
    }

    // Determine exclusion id (for updates) either from DTO or current request
    let excludeId: string | undefined = undefined;

    // 1) Legacy: from DTO hidden field
    if (options.excludeField && object[options.excludeField]) {
      excludeId = object[options.excludeField];
    }

    console.log("excludeId", excludeId);

    // 2) Preferred: from current request context according to configuration
    if (!excludeId && options.excludeFromRequest) {
      const req = RequestContextMiddleware.getRequestContext();

      if (req) {
        const { source, field } = options.excludeFromRequest;
        const containers: Record<string, any> = {
          params: req.params,
          body: req.body,
          query: req.query,
          user: req.user,
        };

        const container = containers[source];
        if (container && typeof container === "object") {
          excludeId = container[field];
        }
      }
    }

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const count = await (this.prisma as any)[options.tableName].count({
      where,
    });
    return count === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const options: UniqueValidationOptions = args.constraints[0];
    const scope = options.scopeField ? ` in this ${options.scopeField}` : "";
    return `${args.property} must be unique${scope}`;
  }
}

export function IsUnique(
  options: UniqueValidationOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}

// Specific decorators for common use cases
export function IsUniqueEmail(validationOptions?: ValidationOptions) {
  return IsUnique(
    {
      tableName: "employee",
      column: "email",
      scopeField: "organizationId",
      excludeFromRequest: { source: "params", field: "id" },
    },
    {
      message: "Email already exists",
      ...validationOptions,
    }
  );
}

export function IsUniquePhone(validationOptions?: ValidationOptions) {
  return IsUnique(
    {
      tableName: "user",
      column: "phone",
      // try to read user id from params on user routes, or from body on composite routes
      excludeFromRequest: { source: "params", field: "id" },
    },
    {
      message: "Phone already exists",
      ...validationOptions,
    }
  );
}

export function IsUniqueEmployeeId(validationOptions?: ValidationOptions) {
  return IsUnique(
    {
      tableName: "employee",
      column: "employeeId",
      scopeField: "organizationId",
      excludeFromRequest: { source: "params", field: "id" },
    },
    {
      message: "Employee ID already exists in this organization",
      ...validationOptions,
    }
  );
}

export function IsUniqueUserId(validationOptions?: ValidationOptions) {
  return IsUnique(
    {
      tableName: "employee",
      column: "userId",
      excludeFromRequest: { source: "params", field: "id" },
    },
    {
      message: "User is already assigned to another employee",
      ...validationOptions,
    }
  );
}

export function IsUniquePatientId(validationOptions?: ValidationOptions) {
  return IsUnique(
    {
      tableName: "patient",
      column: "patientId",
      scopeField: "organizationId",
      excludeFromRequest: { source: "params", field: "id" },
    },
    {
      message: "Patient ID already exists in this organization",
      ...validationOptions,
    }
  );
}
