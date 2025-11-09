import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Type, Expose, Exclude } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

@Exclude()
export class ImageTransformDto {
  @Expose()
  @ApiPropertyOptional({
    description: "Ширина изображения",
    minimum: 1,
    maximum: 4096,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(4096)
  width?: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Высота изображения",
    minimum: 1,
    maximum: 4096,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(4096)
  height?: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Режим масштабирования",
    enum: ["cover", "contain", "fill"],
  })
  @IsEnum(["cover", "contain", "fill"])
  @IsOptional()
  fit?: "cover" | "contain" | "fill";

  @Expose()
  @ApiPropertyOptional({
    description: "Качество изображения (для JPEG/WebP)",
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  quality?: number;
}
