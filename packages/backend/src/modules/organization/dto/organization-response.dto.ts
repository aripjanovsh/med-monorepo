import { Exclude, Expose, Type } from "class-transformer";
import { BaseResponseDto } from "../../../common/dto/response.dto";

@Exclude()
class FileResponseDto {
  @Expose()
  id: string;

  @Expose()
  filename: string;

  @Expose()
  mimeType: string;

  @Expose()
  path: string;
}

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
  logoId?: string;

  @Expose()
  @Type(() => FileResponseDto)
  logo?: FileResponseDto;

  @Expose()
  isActive: boolean;
}
