import { Exclude, Expose, Type } from "class-transformer";
import { FileResponseDto } from "@/modules/file/dto/file-response.dto";
import { ApiProperty } from "@nestjs/swagger";

// Permission DTO for the profile response
@Exclude()
export class PermissionDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  resource: string;

  @Expose()
  @ApiProperty()
  action: string;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;
}

// Role DTO for the profile response
@Exclude()
export class UserRoleDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;

  @Expose()
  @Type(() => PermissionDto)
  @ApiProperty({ type: [PermissionDto] })
  permissions: PermissionDto[];
}

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
  @ApiProperty({ type: [String], description: "List of role names" })
  roles: string[];

  @Expose()
  @Type(() => UserRoleDto)
  @ApiProperty({
    type: [UserRoleDto],
    description: "User roles with permissions",
  })
  userRoles: UserRoleDto[];

  @Expose()
  @ApiProperty({
    type: [String],
    description: "Flat list of unique permission names",
  })
  permissions: string[];

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
