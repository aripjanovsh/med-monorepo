import { Exclude, Expose, Transform } from "class-transformer";
import { BaseResponseDto } from "../../../common/dto/response.dto";

@Exclude()
export class UserResponseDto extends BaseResponseDto {
  @Expose()
  phone?: string;

  @Expose()
  role: string;

  @Expose()
  @Transform(({ obj }) =>
    Array.isArray(obj?.roleAssignments)
      ? obj.roleAssignments
          .map((ra: any) => ra?.role?.name)
          .filter((n: string | undefined) => Boolean(n))
      : obj?.roles || [],
  )
  roles?: string[];

  @Expose()
  isActive: boolean;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  organizationId?: string;

  @Expose()
  @Transform(({ obj }) => obj?.employee?.id)
  employeeId?: string;
}
