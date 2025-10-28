import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Exclude } from "class-transformer";
import { BaseResponseDto } from "@/common/dto/response.dto";

@Exclude()
export class ParameterDefinitionResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  category: string;

  @Expose()
  @ApiProperty()
  valueType: string;

  @Expose()
  @ApiPropertyOptional()
  defaultUnit?: string;

  @Expose()
  @ApiPropertyOptional()
  normalRange?: any;

  @Expose()
  @ApiPropertyOptional()
  description?: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  organizationId: string;
}
