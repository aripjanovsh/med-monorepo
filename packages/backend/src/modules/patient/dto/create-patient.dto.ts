import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Gender, PatientStatus } from "@prisma/client";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { IsUniquePatientId } from "../../../common/decorators/unique.decorator";
import { Expose, Exclude, Type } from "class-transformer";
import { CreatePatientContactDto } from "./create-patient-contact.dto";
import { TransformEmpty } from "@/common/decorators";

@Exclude()
export class CreatePatientDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Internal patient ID unique within organization",
    example: "PAT001",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUniquePatientId()
  patientId?: string;

  @Expose()
  @ApiProperty({
    description: "Patient first name",
    example: "John",
  })
  @IsString()
  firstName: string;

  @Expose()
  @ApiProperty({
    description: "Patient middle name (отчество)",
    example: "Иванович",
    required: false,
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @Expose()
  @ApiProperty({
    description: "Patient last name",
    example: "Doe",
  })
  @IsString()
  lastName: string;

  @Expose()
  @ApiProperty({
    description: "Patient date of birth",
    example: "1990-01-15T00:00:00.000Z",
  })
  @IsDateString()
  dateOfBirth: string;

  @Expose()
  @ApiProperty({
    description: "Patient gender",
    example: Gender.MALE,
    enum: Gender,
  })
  @IsEnum(Gender)
  gender: Gender;

  @Expose()
  @ApiProperty({
    description: "Passport series (серия паспорта)",
    example: "AA",
    required: false,
  })
  @IsOptional()
  @IsString()
  passportSeries?: string;

  @Expose()
  @ApiProperty({
    description: "Passport number (номер паспорта)",
    example: "1234567",
    required: false,
  })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @Expose()
  @ApiProperty({
    description: "Passport issued by (кем выдан)",
    example: "МВД Ташкентской области",
    required: false,
  })
  @IsOptional()
  @IsString()
  passportIssuedBy?: string;

  @Expose()
  @ApiProperty({
    description: "Passport issue date (дата выдачи)",
    example: "2015-01-15T00:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  passportIssueDate?: string;

  @Expose()
  @ApiProperty({
    description: "Passport expiry date (действителен до)",
    example: "2025-01-15T00:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  passportExpiryDate?: string;

  @Expose()
  @ApiProperty({
    description: "Primary language ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  primaryLanguageId?: string;

  @Expose()
  @ApiProperty({
    description: "Secondary language ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  secondaryLanguageId?: string;

  @Expose()
  @ApiProperty({
    description: "Country ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  countryId?: string;

  @Expose()
  @ApiProperty({
    description: "Region ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d482",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  regionId?: string;

  @Expose()
  @ApiProperty({
    description: "City ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d483",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  cityId?: string;

  @Expose()
  @ApiProperty({
    description: "District ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d484",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  districtId?: string;

  @Expose()
  @ApiProperty({
    description: "Specific street address",
    example: "123 Main Street, Apt 4B",
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @Expose()
  @ApiProperty({
    description: "Patient status",
    example: PatientStatus.ACTIVE,
    enum: PatientStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  @Expose()
  @ApiProperty({
    description: "Patient contacts",
    required: false,
    isArray: true,
    type: CreatePatientContactDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePatientContactDto)
  contacts?: CreatePatientContactDto[];

  @Expose()
  @ApiProperty({
    description: "Doctor employee IDs assigned to patient",
    required: false,
    isArray: true,
    type: String,
    example: [
      "2b1d2b6a-4a4f-4d9e-8c4b-1f2b3c4d5e6f",
      "3c2d3e7b-5b6c-4a8d-9e1f-2a3b4c5d6e7f",
    ],
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  @TransformEmpty()
  doctorIds?: string[];
}
