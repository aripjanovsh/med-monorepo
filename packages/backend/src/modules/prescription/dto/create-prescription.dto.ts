import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";

@Exclude()
export class CreatePrescriptionDto {
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
    description: "Medication name",
    example: "Aspirin",
  })
  @IsString()
  name: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Dosage information",
    example: "500mg",
  })
  @IsOptional()
  @IsString()
  dosage?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Frequency of intake",
    example: "2 times per day",
  })
  @IsOptional()
  @IsString()
  frequency?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Duration of treatment",
    example: "7 days",
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Additional notes",
    example: "Take with food",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @Expose()
  @ApiProperty({
    description: "Doctor (Employee) ID who created the prescription",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsString()
  createdById: string;
}
