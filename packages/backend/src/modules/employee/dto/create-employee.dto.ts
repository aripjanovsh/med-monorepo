import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsEmail,
  IsUUID,
  IsBoolean,
  IsObject,
  ValidateIf,
} from "class-validator";
import { EmployeeStatus, Gender } from "@prisma/client";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import {
  IsUniqueEmployeeId,
  IsUniqueEmail,
} from "../../../common/decorators/unique.decorator";
import { RequiredForUserAccount } from "../../../common/decorators/conditional-validation.decorator";
import { Expose, Exclude, Transform } from "class-transformer";
import { Prisma } from "@prisma/client";
import {
  TransformEmpty,
  TransformDate,
  IsDateOrDateTimeString,
  ValidatePassportFields,
} from "@/common/decorators";

@Exclude()
export class CreateEmployeeDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Internal employee ID",
    example: "EMP001",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUniqueEmployeeId()
  employeeId?: string;

  @Expose()
  @ApiProperty({
    description: "Employee first name",
    example: "John",
  })
  @IsString()
  firstName: string;

  @Expose()
  @ApiProperty({
    description: "Employee middle name (отчество)",
    example: "Иванович",
  })
  @IsString()
  middleName: string;

  @Expose()
  @ApiProperty({
    description: "Employee last name",
    example: "Doe",
  })
  @IsString()
  lastName: string;

  @Expose()
  @ApiProperty({
    description: "Employee date of birth",
    example: "1990-01-15",
    required: false,
  })
  @IsOptional()
  @IsDateOrDateTimeString()
  @TransformDate()
  dateOfBirth?: Date;

  @Expose()
  @ApiProperty({
    description: "Employee gender",
    example: Gender.MALE,
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

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
    description: "Employee email (required if createUserAccount is true)",
    example: "john.doe@clinic.com",
    required: false,
  })
  @RequiredForUserAccount({
    message: "Email is required when creating user account",
  })
  @IsOptional()
  @TransformEmpty(null)
  @IsEmail()
  @IsUniqueEmail()
  email?: string;

  @Expose()
  @ApiProperty({
    description: "Employee primary phone number",
    example: "+1234567890",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @Expose()
  @ApiProperty({
    description: "Employee secondary phone number",
    example: "+1234567891",
    required: false,
  })
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @Expose()
  @ApiProperty({
    description: "Employee work phone number",
    example: "+1234567892",
    required: false,
  })
  @IsOptional()
  @IsString()
  workPhone?: string;

  @Expose()
  @ApiProperty({
    description: "Title ID from Title dictionary",
    example: "uuid-title-id",
  })
  @TransformEmpty()
  @IsUUID()
  titleId: string;

  @Expose()
  @ApiProperty({
    description: "Employee salary",
    example: 50000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @Expose()
  @ApiProperty({
    description: "Hire date",
    example: "2024-01-15",
  })
  @IsOptional()
  @TransformEmpty(null)
  @IsDateOrDateTimeString()
  @TransformDate()
  hireDate?: Date;

  @Expose()
  @ApiProperty({
    description: "Work schedule for each day of the week",
    example: {
      monday: { from: "09:00", to: "18:00" },
      tuesday: { from: "09:00", to: "18:00" },
      wednesday: null,
      thursday: { from: "09:00", to: "18:00" },
      friday: { from: "09:00", to: "18:00" },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  workSchedule?: Prisma.InputJsonValue;

  @Expose()
  @ApiProperty({
    description: "Primary language ID from Language dictionary",
    example: "uuid-language-id",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.primaryLanguageId !== undefined)
  @IsUUID()
  primaryLanguageId?: string;

  @Expose()
  @ApiProperty({
    description: "Secondary language ID from Language dictionary",
    example: "uuid-language-id",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.secondaryLanguageId !== undefined)
  @IsUUID()
  secondaryLanguageId?: string;

  @Expose()
  @ApiProperty({
    description: "Enable text notifications",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  textNotificationsEnabled?: boolean;

  @Expose()
  @ApiProperty({
    description: "Additional notes",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @Expose()
  @ApiProperty({
    description: "Country ID from Location dictionary",
    example: "uuid-location-id",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.countryId !== undefined)
  @IsUUID()
  countryId?: string;

  @Expose()
  @ApiProperty({
    description: "Region ID from Location dictionary",
    example: "uuid-location-id",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.regionId !== undefined)
  @IsUUID()
  regionId?: string;

  @Expose()
  @ApiProperty({
    description: "City ID from Location dictionary",
    example: "uuid-location-id",
    required: false,
  })
  @IsOptional()
  @TransformEmpty(null)
  @ValidateIf((o) => o.cityId !== undefined)
  @IsUUID()
  cityId?: string;

  @Expose()
  @ApiProperty({
    description: "District ID from Location dictionary",
    example: "uuid-location-id",
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
    description: "User account phone number",
    example: "+1234567890",
    required: false,
  })
  @IsOptional()
  @IsString()
  userAccountPhone?: string;

  @Expose()
  @ApiProperty({
    description: "User account role IDs",
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
  userAccountRoleIds?: string[];
}
