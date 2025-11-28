import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsEmail, IsUUID } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "Имя" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: "Отчество" })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ description: "Фамилия" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: "Email" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Телефон" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "ID файла аватара" })
  @IsOptional()
  @IsUUID()
  avatarId?: string;
}
