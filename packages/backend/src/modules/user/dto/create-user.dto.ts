import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
} from "class-validator";
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

  @ApiPropertyOptional({
    description: "Role IDs to assign to the user",
    type: [String],
    example: ["role-uuid-1", "role-uuid-2"],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({
    description: "Is user active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
