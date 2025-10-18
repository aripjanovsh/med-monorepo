import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";

@Exclude()
export class CreateLabOrderDto {
  @Expose()
  @ApiProperty({
    description: "Visit ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsString()
  visitId: string;

  @Expose()
  @ApiProperty({
    description: "Test/Analysis name",
    example: "Complete Blood Count (CBC)",
  })
  @IsString()
  testName: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Additional notes",
    example: "Fasting required",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @Expose()
  @ApiProperty({
    description: "Doctor (Employee) ID who created the lab order",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsString()
  createdById: string;
}
