import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional, IsBoolean } from "class-validator";
import { UserRole } from "@prisma/client";
import { Expose } from "class-transformer";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { IsUniquePhone } from "../../../common/decorators/unique.decorator";

export class CreateUserDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiProperty({
    description: "User phone number (E.164)",
    example: "+998901234567",
  })
  @IsString()
  @IsUniquePhone()
  phone: string;

  @ApiProperty({
    description: "User password (hashed)",
  })
  @IsString()
  password: string;

  // User personal name and avatar are removed from User entity by design

  @ApiProperty({
    description: "User role",
    enum: UserRole,
    example: UserRole.DOCTOR,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: "Is user active",
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Email verification removed because login is phone-based
}
