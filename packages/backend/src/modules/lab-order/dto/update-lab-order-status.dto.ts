import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { LabStatus } from "@prisma/client";

@Exclude()
export class UpdateLabOrderStatusDto {
  @Expose()
  @ApiProperty({
    description: "Lab order status",
    enum: LabStatus,
    example: LabStatus.IN_PROGRESS,
  })
  @IsEnum(LabStatus)
  status: LabStatus;
}
