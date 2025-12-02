import { Expose, Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from "class-validator";

export class CreatePromptDto {
  @Expose()
  @IsString()
  key: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsString()
  template: string;

  @Expose()
  @IsOptional()
  @IsString()
  category?: string;

  @Expose()
  @IsOptional()
  @IsString()
  model?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @Type(() => Number)
  temperature?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxTokens?: number;

  @Expose()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromptDto {
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsString()
  template?: string;

  @Expose()
  @IsOptional()
  @IsString()
  category?: string;

  @Expose()
  @IsOptional()
  @IsString()
  model?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @Type(() => Number)
  temperature?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxTokens?: number;

  @Expose()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PromptResponseDto {
  @Expose()
  id: string;

  @Expose()
  key: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose()
  template: string;

  @Expose()
  category: string | null;

  @Expose()
  model: string | null;

  @Expose()
  temperature: number | null;

  @Expose()
  maxTokens: number | null;

  @Expose()
  likeCount: number;

  @Expose()
  dislikeCount: number;

  @Expose()
  usedCount: number;

  @Expose()
  metadata: Record<string, unknown> | null;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
