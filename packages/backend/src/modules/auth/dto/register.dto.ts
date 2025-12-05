import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsUUID,
} from "class-validator";
import { IsUniquePhone } from "../../../common/decorators/unique.decorator";

export class RegisterDto {
  @ApiProperty({
    description: "User phone number (E.164)",
    example: "+998901234567",
  })
  @IsString()
  @IsUniquePhone()
  phone: string;

  @ApiProperty({
    description: "User password",
    example: "password123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
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
}
