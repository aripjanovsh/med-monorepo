import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsEmail,
  IsArray,
  ValidateNested,
  ValidateIf,
} from "class-validator";
import { Gender, PatientStatus } from "@prisma/client";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { IsUniquePatientId } from "../../../common/decorators/unique.decorator";
import { Expose, Exclude, Type } from "class-transformer";
import {
  TransformEmpty,
  TransformDate,
  IsDateOrDateTimeString,
  ValidatePassportFields,
} from "@/common/decorators";

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
    example: "1990-01-15",
  })
  @IsDateOrDateTimeString()
  @TransformDate()
  dateOfBirth: Date;

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
  @TransformEmpty()
  @IsString()
  @ValidatePassportFields()
  passportSeries?: string;

  @Expose()
  @ApiProperty({
    description: "Passport number (номер паспорта)",
    example: "1234567",
    required: false,
  })
  @IsOptional()
  @TransformEmpty()
  @IsString()
  @ValidatePassportFields()
  passportNumber?: string;

  @Expose()
  @ApiProperty({
    description: "Passport issued by (кем выдан)",
    example: "МВД Ташкентской области",
    required: false,
  })
  @IsOptional()
  @TransformEmpty()
  @IsString()
  @ValidatePassportFields()
  passportIssuedBy?: string;

  @Expose()
  @ApiProperty({
    description: "Passport issue date (дата выдачи)",
    example: "2015-01-15",
    required: false,
  })
  @IsOptional()
  @TransformEmpty()
  @IsDateOrDateTimeString()
  @TransformDate()
  @ValidatePassportFields()
  passportIssueDate?: Date;

  @Expose()
  @ApiProperty({
    description: "Passport expiry date (действителен до)",
    example: "2025-01-15",
    required: false,
  })
  @IsOptional()
  @TransformEmpty()
  @IsDateOrDateTimeString()
  @TransformDate()
  @ValidatePassportFields()
  passportExpiryDate?: Date;

  @Expose()
  @ApiProperty({
    description: "Primary language ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.primaryLanguageId !== undefined)
  @IsUUID()
  primaryLanguageId?: string;

  @Expose()
  @ApiProperty({
    description: "Secondary language ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.secondaryLanguageId !== undefined)
  @IsUUID()
  secondaryLanguageId?: string;

  @Expose()
  @ApiProperty({
    description: "Country ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.countryId !== undefined)
  @IsUUID()
  countryId?: string;

  @Expose()
  @ApiProperty({
    description: "Region ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d482",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.regionId !== undefined)
  @IsUUID()
  regionId?: string;

  @Expose()
  @ApiProperty({
    description: "City ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d483",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.cityId !== undefined)
  @IsUUID()
  cityId?: string;

  @Expose()
  @ApiProperty({
    description: "District ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d484",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.districtId !== undefined)
  @IsUUID()
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
    description: "Patient primary phone number",
    example: "+998901234567",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @Expose()
  @ApiProperty({
    description: "Patient secondary phone number",
    example: "+998901234568",
    required: false,
  })
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @Expose()
  @ApiProperty({
    description: "Patient email address",
    example: "patient@example.com",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @IsEmail()
  email?: string;
}
