import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { LanguageResponseDto } from "../../master-data/language/dto/language-response.dto";
import { LocationResponseDto } from "../../master-data/location/dto/location-response.dto";

@Exclude()
export class PatientContactResponseDto {
  @Expose()
  @ApiProperty({ description: "Contact ID", example: "uuid-contact-id" })
  id: string;

  @Expose()
  @ApiProperty({ description: "Contact relation type", example: "SELF" })
  relation: string;

  @Expose()
  @ApiProperty({ description: "Contact type", example: "PRIMARY" })
  type: string;

  @Expose()
  @ApiProperty({
    description: "Contact first name",
    example: "Jane",
    required: false,
  })
  firstName?: string;

  @Expose()
  @ApiProperty({
    description: "Contact last name",
    example: "Smith",
    required: false,
  })
  lastName?: string;

  @Expose()
  @ApiProperty({ description: "Primary phone number", example: "+1234567890" })
  primaryPhone: string;

  @Expose()
  @ApiProperty({
    description: "Secondary phone number",
    example: "+1234567891",
    required: false,
  })
  secondaryPhone?: string;

  @Expose()
  @ApiProperty({
    description: "Address",
    example: "123 Main St",
    required: false,
  })
  address?: string;

  @Expose()
  @ApiProperty({ description: "City", example: "New York", required: false })
  city?: string;

  @Expose()
  @ApiProperty({ description: "State", example: "NY", required: false })
  state?: string;

  @Expose()
  @ApiProperty({ description: "Country", example: "USA", required: false })
  country?: string;

  @Expose()
  @ApiProperty({ description: "Text notifications enabled", example: true })
  textNotificationsEnabled: boolean;

  @Expose()
  @ApiProperty({ description: "Email notifications enabled", example: true })
  emailNotificationsEnabled: boolean;

  @Expose()
  @ApiProperty({
    description: "Contact creation date",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: "Contact last update date",
    example: "2024-01-01T00:00:00.000Z",
  })
  updatedAt: Date;
}

@Exclude()
export class PatientDoctorResponseDto {
  @Expose()
  @ApiProperty({
    description: "Doctor assignment ID",
    example: "uuid-assignment-id",
  })
  id: string;

  @Expose()
  @ApiProperty({ description: "Employee ID", example: "uuid-employee-id" })
  employeeId: string;

  @Expose()
  @ApiProperty({ description: "Doctor first name", example: "John" })
  firstName: string;

  @Expose()
  @ApiProperty({ description: "Doctor last name", example: "Smith" })
  lastName: string;

  @Expose()
  @ApiProperty({
    description: "Assigned date",
    example: "2024-01-01T00:00:00.000Z",
  })
  assignedAt: Date;

  @Expose()
  @ApiProperty({ description: "Is active assignment", example: true })
  isActive: boolean;
}

@Exclude()
export class PatientResponseDto {
  @Expose()
  @ApiProperty({ description: "Patient ID", example: "uuid-patient-id" })
  id: string;

  @Expose()
  @ApiProperty({
    description: "Internal patient ID",
    example: "PAT001",
    required: false,
  })
  patientId?: string;

  @Expose()
  @ApiProperty({ description: "Patient first name", example: "John" })
  firstName: string;

  @Expose()
  @ApiProperty({
    description: "Patient middle name (отчество)",
    example: "Иванович",
    required: false,
  })
  middleName?: string;

  @Expose()
  @ApiProperty({ description: "Patient last name", example: "Doe" })
  lastName: string;

  @Expose()
  @ApiProperty({
    description: "Date of birth",
    example: "1990-01-15T00:00:00.000Z",
  })
  dateOfBirth: Date;

  @Expose()
  @ApiProperty({ description: "Patient gender", example: "MALE" })
  gender: string;

  @Expose()
  @ApiProperty({
    description: "Passport series (серия паспорта)",
    example: "AA",
    required: false,
  })
  passportSeries?: string;

  @Expose()
  @ApiProperty({
    description: "Passport number (номер паспорта)",
    example: "1234567",
    required: false,
  })
  passportNumber?: string;

  @Expose()
  @ApiProperty({
    description: "Passport issued by (кем выдан)",
    example: "МВД Ташкентской области",
    required: false,
  })
  passportIssuedBy?: string;

  @Expose()
  @ApiProperty({
    description: "Passport issue date (дата выдачи)",
    example: "2015-01-15T00:00:00.000Z",
    required: false,
  })
  passportIssueDate?: Date;

  @Expose()
  @ApiProperty({
    description: "Passport expiry date (действителен до)",
    example: "2025-01-15T00:00:00.000Z",
    required: false,
  })
  passportExpiryDate?: Date;

  @Expose()
  @ApiProperty({
    description: "Primary language",
    type: LanguageResponseDto,
    required: false,
  })
  @Type(() => LanguageResponseDto)
  primaryLanguage?: LanguageResponseDto;

  @Expose()
  @ApiProperty({
    description: "Secondary language",
    type: LanguageResponseDto,
    required: false,
  })
  @Type(() => LanguageResponseDto)
  secondaryLanguage?: LanguageResponseDto;

  @Expose()
  @ApiProperty({
    description: "Country",
    type: LocationResponseDto,
    required: false,
  })
  @Type(() => LocationResponseDto)
  country?: LocationResponseDto;

  @Expose()
  @ApiProperty({
    description: "Region",
    type: LocationResponseDto,
    required: false,
  })
  @Type(() => LocationResponseDto)
  region?: LocationResponseDto;

  @Expose()
  @ApiProperty({
    description: "City",
    type: LocationResponseDto,
    required: false,
  })
  @Type(() => LocationResponseDto)
  city?: LocationResponseDto;

  @Expose()
  @ApiProperty({
    description: "District",
    type: LocationResponseDto,
    required: false,
  })
  @Type(() => LocationResponseDto)
  district?: LocationResponseDto;

  @Expose()
  @ApiProperty({
    description: "Specific street address",
    example: "123 Main Street, Apt 4B",
    required: false,
  })
  address?: string;

  @Expose()
  @ApiProperty({ description: "Patient status", example: "ACTIVE" })
  status: string;

  @Expose()
  @ApiProperty({
    description: "Last visited date",
    example: "2024-01-15T00:00:00.000Z",
    required: false,
  })
  lastVisitedAt?: Date;

  @Expose()
  @ApiProperty({
    description: "Organization ID",
    example: "uuid-organization-id",
  })
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "Created by user ID", example: "uuid-user-id" })
  createdBy: string;

  @Expose()
  @ApiProperty({
    description: "Patient creation date",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: "Patient last update date",
    example: "2024-01-01T00:00:00.000Z",
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    description: "Patient contacts",
    type: [PatientContactResponseDto],
  })
  @Type(() => PatientContactResponseDto)
  contacts: PatientContactResponseDto[];

  @Expose()
  @ApiProperty({
    description: "Assigned doctors",
    type: [PatientDoctorResponseDto],
  })
  @Type(() => PatientDoctorResponseDto)
  doctors: PatientDoctorResponseDto[];
}
