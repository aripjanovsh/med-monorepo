import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { VisitStatus } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { IsUUID } from "class-validator";

@Exclude()
export class FindActiveVisitDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "Patient ID" })
  @IsUUID()
  patientId: string;
}

@Exclude()
class ActiveVisitEmployeeDto {
  @Expose()
  @ApiProperty({ description: "Employee ID" })
  id: string;

  @Expose()
  @ApiProperty({ description: "First name" })
  firstName: string;

  @Expose()
  @ApiPropertyOptional({ description: "Middle name" })
  middleName?: string;

  @Expose()
  @ApiProperty({ description: "Last name" })
  lastName: string;
}

@Exclude()
class ActiveVisitDepartmentDto {
  @Expose()
  @ApiProperty({ description: "Department ID" })
  id: string;

  @Expose()
  @ApiProperty({ description: "Department name" })
  name: string;
}

@Exclude()
class ActiveVisitTitleDto {
  @Expose()
  @ApiProperty({ description: "Title ID" })
  id: string;

  @Expose()
  @ApiProperty({ description: "Title name" })
  name: string;
}

@Exclude()
export class ActiveVisitResponseDto {
  @Expose()
  @ApiProperty({ description: "Visit ID" })
  id: string;

  @Expose()
  @ApiProperty({ description: "Visit status", enum: VisitStatus })
  status: VisitStatus;

  @Expose()
  @ApiProperty({ description: "Visit date" })
  visitDate: Date;

  @Expose()
  @ApiPropertyOptional({ description: "Time when visit started" })
  startedAt?: Date;

  @Expose()
  @ApiPropertyOptional({ description: "Time when patient was queued" })
  queuedAt?: Date;

  @Expose()
  @ApiPropertyOptional({ description: "Visit notes" })
  notes?: string;

  @Expose()
  @ApiProperty({
    description: "Doctor information",
    type: ActiveVisitEmployeeDto,
  })
  @Type(() => ActiveVisitEmployeeDto)
  employee: ActiveVisitEmployeeDto & {
    department?: ActiveVisitDepartmentDto;
    title?: ActiveVisitTitleDto;
  };
}
