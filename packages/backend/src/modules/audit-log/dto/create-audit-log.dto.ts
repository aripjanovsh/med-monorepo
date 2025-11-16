import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
} from "class-validator";
import { AuditAction } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { Expose, Exclude } from "class-transformer";

@Exclude()
export class CreateAuditLogDto {
  @Expose()
  @ApiProperty({
    description: "Action performed",
    example: AuditAction.CREATE,
    enum: AuditAction,
  })
  @IsEnum(AuditAction)
  action: AuditAction;

  @Expose()
  @ApiProperty({
    description: "Resource type (model name)",
    example: "Patient",
  })
  @IsString()
  resource: string;

  @Expose()
  @ApiProperty({
    description: "Resource ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @Expose()
  @ApiProperty({
    description: "User ID who performed the action",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d480",
  })
  @IsUUID()
  userId: string;

  @Expose()
  @ApiProperty({
    description: "Employee ID who performed the action",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "IP address",
    example: "192.168.1.1",
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Expose()
  @ApiProperty({
    description: "User agent",
    example: "Mozilla/5.0...",
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @Expose()
  @ApiProperty({
    description: "Additional metadata",
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @Expose()
  @ApiProperty({
    description: "Changed fields (for UPDATE action)",
    required: false,
  })
  @IsOptional()
  @IsObject()
  changes?: Record<string, unknown>;
}
