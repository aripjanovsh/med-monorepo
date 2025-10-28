import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID, IsEnum } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { AllergySeverity } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class CreatePatientAllergyDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "Patient ID" })
  @IsUUID()
  @IsString()
  patientId: string;

  @Expose()
  @ApiPropertyOptional({ description: "Visit ID" })
  @IsOptional()
  @IsUUID()
  @IsString()
  visitId?: string;

  @Expose()
  @ApiProperty({ description: "Employee ID who recorded" })
  @IsUUID()
  @IsString()
  recordedById: string;

  @Expose()
  @ApiProperty({ description: "Allergen substance", example: "Пенициллин" })
  @IsString()
  substance: string;

  @Expose()
  @ApiPropertyOptional({ description: "Reaction description" })
  @IsOptional()
  @IsString()
  reaction?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Severity", enum: AllergySeverity })
  @IsOptional()
  @IsEnum(AllergySeverity)
  severity?: AllergySeverity;

  @Expose()
  @ApiPropertyOptional({ description: "Additional notes" })
  @IsOptional()
  @IsString()
  note?: string;
}
