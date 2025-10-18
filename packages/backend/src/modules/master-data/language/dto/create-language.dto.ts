import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
} from "class-validator";

export class CreateLanguageDto {
  @ApiProperty({
    description: "Language name",
    example: "English",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: "Language ISO code",
    example: "en",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  code?: string;

  @ApiProperty({
    description: "Native name of the language",
    example: "English",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nativeName?: string;

  @ApiProperty({
    description: "Weight for sorting (lower values appear first)",
    example: 1,
    required: false,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: "Language description",
    example: "English language",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
