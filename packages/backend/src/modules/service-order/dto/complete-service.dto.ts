import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CompleteServiceDto {
  @ApiProperty({ required: true })
  @IsString()
  organizationId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resultText?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  resultData?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resultFileUrl?: string;
}
