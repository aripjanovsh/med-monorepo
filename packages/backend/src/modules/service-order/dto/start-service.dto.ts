import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StartServiceDto {
  @ApiProperty({ required: true })
  @IsString()
  organizationId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  performedById?: string;
}
