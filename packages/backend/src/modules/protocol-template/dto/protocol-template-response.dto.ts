import { Exclude, Expose, Type } from "class-transformer";
import { BaseResponseDto } from "../../../common/dto/response.dto";
import { OrganizationResponseDto } from "../../organization/dto/organization-response.dto";

@Exclude()
export class ProtocolTemplateResponseDto extends BaseResponseDto {
  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  content: string;

  @Expose()
  templateType: string;

  @Expose()
  isActive: boolean;

  @Expose()
  organizationId: string;

  @Expose()
  @Type(() => OrganizationResponseDto)
  organization?: OrganizationResponseDto;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy?: string;
}
