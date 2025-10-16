import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "User phone number (E.164)",
    example: "+998901234567",
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: "User password",
    example: "Admin123!",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
