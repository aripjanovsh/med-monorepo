import { Type } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";
import { Expose } from "class-transformer";
import { TransformDecimal } from "@/common/decorators";
import { SafeDecimal } from "@/common/types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateInvoiceItemDto {
  @ApiProperty({ description: "Service ID" })
  @Expose()
  @IsString()
  serviceId: string;

  @ApiPropertyOptional({ description: "Service Order ID (if linked)" })
  @Expose()
  @IsOptional()
  @IsString()
  serviceOrderId?: string;

  @ApiProperty({ description: "Quantity", minimum: 1, default: 1 })
  @Expose()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: "Unit price (defaults to Service.price)" })
  @Expose()
  @IsOptional()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: "Discount amount", minimum: 0, default: 0 })
  @Expose()
  @IsOptional()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: "Item description" })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}
