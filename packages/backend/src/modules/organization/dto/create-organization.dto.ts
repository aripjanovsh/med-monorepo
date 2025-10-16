import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsUrl,
} from "class-validator";

export class CreateOrganizationDto {
  @ApiProperty({
    description: "Organization name",
    example: "City Medical Center",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "URL-friendly identifier",
    example: "city-medical-center",
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: "Organization address",
    example: "123 Medical Street, City, State 12345",
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: "Contact phone number",
    example: "+1-555-123-4567",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: "Contact email",
    example: "contact@citymedical.com",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: "Organization website",
    example: "https://citymedical.com",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: "Organization description",
    example: "Leading healthcare provider in the city",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Is organization active",
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
