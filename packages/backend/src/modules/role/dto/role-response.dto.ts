import { BaseResponseDto } from "@/common/dto/response.dto";
import { ApiProperty } from "@nestjs/swagger";

export class RoleResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: "Role name",
    example: "Senior Doctor",
  })
  name: string;

  @ApiProperty({
    description: "Role description",
    example: "Senior doctor with advanced privileges",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "Is role active",
    default: true,
    required: false,
  })
  isActive?: boolean;
}
