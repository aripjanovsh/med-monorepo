import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsArray } from "class-validator";

export class CreateRoleDto {
  @ApiProperty({
    description: "Role name",
    example: "Senior Doctor",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Role description",
    example: "Senior doctor with advanced privileges",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Is role active",
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: "Is system role (cannot be deleted)",
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({
    description: "Permission names to assign to this role",
    example: ["manage_patients", "manage_visits"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
