import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class LanguageResponseDto {
  @ApiProperty({
    description: "Language ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Language name",
    example: "English",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "Language ISO code",
    example: "en",
    required: false,
  })
  @Expose()
  code?: string;

  @ApiProperty({
    description: "Native name of the language",
    example: "English",
    required: false,
  })
  @Expose()
  nativeName?: string;

  @ApiProperty({
    description: "Weight for sorting (lower values appear first)",
    example: 1,
  })
  @Expose()
  weight: number;

  @ApiProperty({
    description: "Language description",
    example: "English language",
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: "Whether the language is active",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: "Creation date",
    example: "2023-01-01T00:00:00Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2023-01-01T00:00:00Z",
  })
  @Expose()
  updatedAt: Date;
}
