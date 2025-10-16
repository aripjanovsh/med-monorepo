import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  ValidateIf,
} from "class-validator";
import { ContactRelationType, ContactType } from "@prisma/client";
import { Expose, Exclude } from "class-transformer";

@Exclude()
export class CreatePatientContactDto {
  @Expose()
  @ApiProperty({
    description: "Contact relation type",
    example: ContactRelationType.SELF,
    enum: ContactRelationType,
  })
  @IsEnum(ContactRelationType)
  relation: ContactRelationType;

  @Expose()
  @ApiProperty({
    description: "Contact type",
    example: ContactType.PRIMARY,
    enum: ContactType,
  })
  @IsEnum(ContactType)
  type: ContactType;

  @Expose()
  @ApiProperty({
    description: "Contact first name (required for non-self relations)",
    example: "Jane",
    required: false,
  })
  @ValidateIf((o) => o.relation !== ContactRelationType.SELF)
  @IsString()
  firstName?: string;

  @Expose()
  @ApiProperty({
    description: "Contact last name (required for non-self relations)",
    example: "Smith",
    required: false,
  })
  @ValidateIf((o) => o.relation !== ContactRelationType.SELF)
  @IsString()
  lastName?: string;

  @Expose()
  @ApiProperty({
    description: "Primary phone number",
    example: "+1234567890",
  })
  @IsString()
  primaryPhone: string;

  @Expose()
  @ApiProperty({
    description: "Secondary phone number",
    example: "+1234567891",
    required: false,
  })
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @Expose()
  @ApiProperty({
    description: "Address",
    example: "123 Main St",
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @Expose()
  @ApiProperty({
    description: "City",
    example: "New York",
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @Expose()
  @ApiProperty({
    description: "State",
    example: "NY",
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @Expose()
  @ApiProperty({
    description: "Country",
    example: "USA",
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @Expose()
  @ApiProperty({
    description: "Text notifications enabled",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  textNotificationsEnabled?: boolean;

  @Expose()
  @ApiProperty({
    description: "Email notifications enabled",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailNotificationsEnabled?: boolean;
}
