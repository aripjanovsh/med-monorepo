import { Exclude, Expose, Type } from "class-transformer";
import { FileResponseDto } from "@/modules/file/dto/file-response.dto";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class MeResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  phone: string;

  @Expose()
  @ApiProperty()
  role: string;

  @Expose()
  @ApiProperty()
  roles: string[];

  @Expose()
  @ApiProperty()
  organizationId: string;

  @Expose()
  @ApiProperty()
  employeeId: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  middleName: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  avatarId: string;

  @Expose()
  @Type(() => FileResponseDto)
  @ApiProperty()
  avatar: FileResponseDto;
}
