import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from "class-validator";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export class UpdateServiceOrderDto {
  @ApiPropertyOptional({ description: "Order status", enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: "Payment status", enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: "Result text" })
  @IsOptional()
  @IsString()
  resultText?: string;

  @ApiPropertyOptional({ description: "Result data (JSON)" })
  @IsOptional()
  resultData?: Record<string, any>;

  @ApiPropertyOptional({ description: "Result file URL" })
  @IsOptional()
  @IsString()
  resultFileUrl?: string;

  @ApiPropertyOptional({ description: "Result date" })
  @IsOptional()
  @IsDateString()
  resultAt?: Date;

  @ApiPropertyOptional({ description: "Performed by user ID" })
  @IsOptional()
  @IsUUID()
  performedById?: string;

  @ApiPropertyOptional({ description: "Organization ID for validation" })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
