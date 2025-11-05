import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class QueueActionDto {
  @ApiProperty({ required: true })
  @IsString()
  organizationId!: string;
}
