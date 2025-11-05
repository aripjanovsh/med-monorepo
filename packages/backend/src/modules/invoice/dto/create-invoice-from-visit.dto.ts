import { IsNotEmpty, IsOptional, IsString, IsUUID, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AddInvoiceItemDto } from "./add-invoice-item.dto";

export class CreateInvoiceFromVisitDto {
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @IsNotEmpty()
  @IsUUID()
  visitId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddInvoiceItemDto)
  additionalServices?: AddInvoiceItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  dueDate?: string;
}
