import { Type, Transform } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
} from "class-validator";
import { Expose } from "class-transformer";
import { PaymentStatus } from "@prisma/client";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export class FindAllInvoiceDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
  @ApiPropertyOptional({ description: "Filter by patient ID" })
  @Expose()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ description: "Filter by visit ID" })
  @Expose()
  @IsOptional()
  @IsString()
  visitId?: string;

  @ApiPropertyOptional({ enum: PaymentStatus, description: "Filter by payment status" })
  @Expose()
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: "Filter by date from (ISO 8601)" })
  @Expose()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "Filter by date to (ISO 8601)" })
  @Expose()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: "Search by invoice number or patient name" })
  @Expose()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Page number", minimum: 1, default: 1 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", minimum: 1, default: 20 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
