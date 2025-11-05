import { Type, Transform } from "class-transformer";
import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDateString,
} from "class-validator";
import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateInvoiceItemDto } from "./create-invoice-item.dto";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export class CreateInvoiceDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiProperty({ description: "Patient ID" })
  @Expose()
  @IsString()
  patientId: string;

  @ApiPropertyOptional({ description: "Visit ID (if linked to visit)" })
  @Expose()
  @IsOptional()
  @IsString()
  visitId?: string;

  @ApiProperty({ description: "Invoice items (services)", type: [CreateInvoiceItemDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @ApiPropertyOptional({ description: "Notes" })
  @Expose()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "Due date (ISO 8601)" })
  @Expose()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
