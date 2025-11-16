import { ApiProperty } from "@nestjs/swagger";
import { AuditAction } from "@prisma/client";

export class AuditLogResponseDto {
  @ApiProperty({
    description: "Audit log ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  id: string;

  @ApiProperty({
    description: "Action performed",
    example: AuditAction.CREATE,
    enum: AuditAction,
  })
  action: AuditAction;

  @ApiProperty({
    description: "Resource type",
    example: "Patient",
  })
  resource: string;

  @ApiProperty({
    description: "Resource ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    required: false,
  })
  resourceId?: string;

  @ApiProperty({
    description: "User ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
  })
  userId: string;

  @ApiProperty({
    description: "Employee ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d482",
    required: false,
  })
  employeeId?: string;

  @ApiProperty({
    description: "Organization ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d483",
  })
  organizationId: string;

  @ApiProperty({
    description: "IP address",
    example: "192.168.1.1",
    required: false,
  })
  ipAddress?: string;

  @ApiProperty({
    description: "User agent",
    example: "Mozilla/5.0...",
    required: false,
  })
  userAgent?: string;

  @ApiProperty({
    description: "Additional metadata",
    required: false,
  })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    description: "Changed fields",
    required: false,
  })
  changes?: Record<string, unknown>;

  @ApiProperty({
    description: "Created at timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "User information",
    required: false,
  })
  user?: {
    id: string;
    phone: string;
    role: string;
  };

  @ApiProperty({
    description: "Employee information",
    required: false,
  })
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({
    description: "Related resource data (if includeResource=true)",
    required: false,
  })
  relatedResource?: any;
}
