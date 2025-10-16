import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum } from "class-validator";
import { PermissionAction } from "@prisma/client";

export class CreatePermissionDto {
  @ApiProperty({
    description: "Permission name",
    example: "manage_patients",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Resource this permission applies to",
    example: "patients",
  })
  @IsString()
  resource: string;

  @ApiProperty({
    description: "Action that can be performed",
    enum: PermissionAction,
    example: PermissionAction.MANAGE,
  })
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiProperty({
    description: "Permission description",
    example: "Full access to manage patient records",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
