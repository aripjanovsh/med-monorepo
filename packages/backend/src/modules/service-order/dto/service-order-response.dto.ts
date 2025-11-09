import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { TransformDecimal } from "@/common/decorators";
import { SafeDecimal } from "@/common/types";

class ServiceOrderPatientDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiPropertyOptional()
  @Expose()
  patientId?: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiPropertyOptional()
  @Expose()
  middleName?: string;

  @ApiProperty()
  @Expose()
  lastName: string;
}

class ServiceOrderDoctorDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiPropertyOptional()
  @Expose()
  employeeId?: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiPropertyOptional()
  @Expose()
  middleName?: string;

  @ApiProperty()
  @Expose()
  lastName: string;
}

class ServiceOrderServiceDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  code?: string;

  @ApiPropertyOptional()
  @Expose()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  price?: number;

  @ApiPropertyOptional()
  @Expose()
  type?: string;
}

class ServiceOrderDepartmentDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  code?: string;
}

class ServiceOrderProtocolDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;
}

class ServiceOrderPerformedByDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiPropertyOptional()
  @Expose()
  middleName?: string;

  @ApiProperty()
  @Expose()
  lastName: string;
}

export class ServiceOrderResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  patientId: string;

  @ApiProperty({ type: ServiceOrderPatientDto })
  @Expose()
  @Type(() => ServiceOrderPatientDto)
  patient: ServiceOrderPatientDto;

  @ApiPropertyOptional()
  @Expose()
  visitId?: string;

  @ApiProperty()
  @Expose()
  doctorId: string;

  @ApiProperty({ type: ServiceOrderDoctorDto })
  @Expose()
  @Type(() => ServiceOrderDoctorDto)
  doctor: ServiceOrderDoctorDto;

  @ApiProperty()
  @Expose()
  serviceId: string;

  @ApiProperty({ type: ServiceOrderServiceDto })
  @Expose()
  @Type(() => ServiceOrderServiceDto)
  service: ServiceOrderServiceDto;

  @ApiPropertyOptional()
  @Expose()
  departmentId?: string;

  @ApiPropertyOptional({ type: ServiceOrderDepartmentDto })
  @Expose()
  @Type(() => ServiceOrderDepartmentDto)
  department?: ServiceOrderDepartmentDto;

  @ApiPropertyOptional()
  @Expose()
  protocolTemplateId?: string;

  @ApiPropertyOptional({ type: ServiceOrderProtocolDto })
  @Expose()
  @Type(() => ServiceOrderProtocolDto)
  protocolTemplate?: ServiceOrderProtocolDto;

  @ApiProperty({ enum: OrderStatus })
  @Expose()
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  @Expose()
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional()
  @Expose()
  resultText?: string;

  @ApiPropertyOptional()
  @Expose()
  resultData?: Record<string, any>;

  @ApiPropertyOptional()
  @Expose()
  resultFileUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  resultAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  performedById?: string;

  @ApiPropertyOptional({ type: ServiceOrderPerformedByDto })
  @Expose()
  @Type(() => ServiceOrderPerformedByDto)
  performedBy?: ServiceOrderPerformedByDto;

  @ApiPropertyOptional()
  @Expose()
  startedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  finishedAt?: Date;

  @ApiProperty()
  @Expose()
  organizationId: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
