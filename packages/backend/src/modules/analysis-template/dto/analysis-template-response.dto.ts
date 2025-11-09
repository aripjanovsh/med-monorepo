import { Exclude, Expose, Type } from "class-transformer";
import { BaseResponseDto } from "../../../common/dto/response.dto";
import { OrganizationResponseDto } from "../../organization/dto/organization-response.dto";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class AnalysisTemplateResponseDto extends BaseResponseDto {
  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description?: string;

  @Expose()
  @ApiProperty({
    description: "Analysis template content (JSON string with sections structure)",
    example: '{"version":1,"sections":[{"id":"section-1","title":"Основные показатели","parameters":[...]}]}',
  })
  content: string;

  @Expose()
  isActive: boolean;

  @Expose()
  organizationId: string;

  @Expose()
  @Type(() => OrganizationResponseDto)
  organization?: OrganizationResponseDto;

  @Expose()
  createdBy?: string;

  @Expose()
  updatedBy?: string;
}
