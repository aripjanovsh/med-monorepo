import { Exclude, Expose } from "class-transformer";
import { BaseResponseDto } from "../../../common/dto/response.dto";

@Exclude()
export class OrganizationResponseDto extends BaseResponseDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  address?: string;

  @Expose()
  phone?: string;

  @Expose()
  email?: string;

  @Expose()
  website?: string;

  @Expose()
  description?: string;

  @Expose()
  isActive: boolean;
}
