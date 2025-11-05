import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Expose } from "class-transformer";
import { TransformDecimal } from "@/common/decorators";
import { SafeDecimal } from "@/common/types";
import { PaymentMethod } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export class CreatePaymentDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
  @ApiProperty({ description: "Payment amount", minimum: 0.01 })
  @Expose()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: "Payment method" })
  @Expose()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: "Transaction ID (for online/card payments)" })
  @Expose()
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: "Payment notes" })
  @Expose()
  @IsOptional()
  @IsString()
  notes?: string;
}
