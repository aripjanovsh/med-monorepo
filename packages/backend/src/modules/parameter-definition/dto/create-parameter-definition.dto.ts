import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, IsBoolean } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { ParameterType } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class CreateParameterDefinitionDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "Unique parameter code", example: "PULSE" })
  @IsString()
  code: string;

  @Expose()
  @ApiProperty({ description: "Parameter name", example: "Пульс" })
  @IsString()
  name: string;

  @Expose()
  @ApiProperty({ description: "Category", example: "VITALS_CORE" })
  @IsString()
  category: string;

  @Expose()
  @ApiProperty({ description: "Value type", enum: ParameterType })
  @IsEnum(ParameterType)
  valueType: ParameterType;

  @Expose()
  @ApiPropertyOptional({ description: "Default unit", example: "bpm" })
  @IsOptional()
  @IsString()
  defaultUnit?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Normal range as JSON" })
  @IsOptional()
  normalRange?: any;

  @Expose()
  @ApiPropertyOptional({ description: "Description or comment" })
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Is active", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
