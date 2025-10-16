import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsDateString } from "class-validator";
import { TransformDate } from "@/common/decorators";

export class AssignRoleDto {
  @ApiProperty({
    description: "User ID to assign role to",
    example: "uuid-string",
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: "Role ID to assign",
    example: "uuid-string",
  })
  @IsString()
  roleId: string;

  @ApiProperty({
    description: "User ID who is assigning this role",
    example: "uuid-string",
    required: false,
  })
  @IsOptional()
  @IsString()
  assignedBy?: string;

  @ApiProperty({
    description: "Role expiration date",
    example: "2024-12-31T00:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @TransformDate()
  expiresAt?: Date;
}
