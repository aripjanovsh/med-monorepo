import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsString } from "class-validator";
import { UserRole } from "@prisma/client";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";

export class FindAllUserDto extends FindAllQueryDto {
  @ApiPropertyOptional({
    description: "Filter by user role",
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: "Filter by active status",
  })
  @IsOptional()
  isActive?: boolean;
}
