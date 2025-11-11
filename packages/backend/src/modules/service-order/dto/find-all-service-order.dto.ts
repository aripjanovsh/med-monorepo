import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  IsString,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export class FindAllServiceOrderDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: "Items per page", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: "Organization ID" })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: "Visit ID" })
  @IsOptional()
  @IsUUID()
  visitId?: string;

  @ApiPropertyOptional({ description: "Doctor ID" })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: "Doctor ID" })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ description: "Service ID" })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({
    description: "Department ID (comma-separated for multiple)",
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    description: "Order status (comma-separated for multiple)",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Payment status (comma-separated for multiple)",
  })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({
    description: "Service type (LAB, DIAGNOSTIC, PROCEDURE, CONSULTATION)",
  })
  @IsOptional()
  @IsString()
  serviceType?: string;

  @ApiPropertyOptional({
    description: "Search by service name or patient name",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Start date for filtering (ISO 8601 format)",
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: "End date for filtering (ISO 8601 format)",
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: "Sort by field", default: "createdAt" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder?: "asc" | "desc";
}
