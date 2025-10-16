import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsEnum } from "class-validator";
import { UserRole } from "@prisma/client";
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

  // Optionally allow setting a base enum role; multiple custom roles can be assigned separately

  @ApiProperty({
    description: "User role",
    enum: UserRole,
    example: UserRole.DOCTOR,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
