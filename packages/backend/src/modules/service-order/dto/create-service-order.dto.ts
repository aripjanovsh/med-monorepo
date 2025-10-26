import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { Expose } from "class-transformer";

export class ServiceOrderItemDto {
  @ApiProperty({ description: "Service ID" })
  @IsUUID()
  serviceId: string;
}

export class CreateServiceOrderDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiProperty({ description: "Visit ID" })
  @IsUUID()
  visitId: string;

  @ApiProperty({ description: "Patient ID" })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: "Employee ID (doctor)" })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: "Array of services to order",
    type: [ServiceOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderItemDto)
  services: ServiceOrderItemDto[];

  @ApiPropertyOptional({ description: "Protocol template ID" })
  @IsOptional()
  @IsUUID()
  protocolTemplateId?: string;
}
