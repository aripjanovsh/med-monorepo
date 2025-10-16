import { Exclude, Expose } from "class-transformer";
import { BaseResponseDto } from "../../../common/dto/response.dto";
import { UserResponseDto } from "../../user/dto/user-response.dto";
import { OrganizationResponseDto } from "../../organization/dto/organization-response.dto";
import { TitleResponseDto } from "../../master-data/title/dto/title-response.dto";
import { Type } from "class-transformer";
import { SafeDecimal } from "../../../common/types";
import { TransformDecimal } from "../../../common/decorators/transform-decimal.decorator";
import { WorkScheduleDto } from "./work-schedule.dto";
import { ServiceTypeResponseDto } from "@/modules/master-data/service-type/dto/service-type-response.dto";
import { LanguageResponseDto } from "../../master-data/language/dto/language-response.dto";
import { LocationResponseDto } from "../../master-data/location/dto/location-response.dto";

@Exclude()
export class EmployeeResponseDto extends BaseResponseDto {
  @Expose()
  userId?: string;

  @Expose()
  employeeId?: string;

  @Expose()
  firstName: string;

  @Expose()
  middleName?: string;

  @Expose()
  lastName: string;

  @Expose()
  dateOfBirth?: Date;

  @Expose()
  gender?: string;

  @Expose()
  passportSeries?: string;

  @Expose()
  passportNumber?: string;

  @Expose()
  passportIssuedBy?: string;

  @Expose()
  passportIssueDate?: Date;

  @Expose()
  passportExpiryDate?: Date;

  @Expose()
  email?: string;

  @Expose()
  phone?: string;

  @Expose()
  secondaryPhone?: string;

  @Expose()
  workPhone?: string;

  @Expose()
  titleId?: string;

  @Expose()
  @Type(() => TitleResponseDto)
  title?: TitleResponseDto;

  @Expose()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  salary?: number;

  @Expose()
  hireDate: Date;

  @Expose()
  terminationDate?: Date;

  @Expose()
  status: string;

  @Expose()
  @Type(() => WorkScheduleDto)
  workSchedule?: WorkScheduleDto;

  @Expose()
  primaryLanguageId?: string;

  @Expose()
  @Type(() => LanguageResponseDto)
  primaryLanguage?: LanguageResponseDto;

  @Expose()
  secondaryLanguageId?: string;

  @Expose()
  @Type(() => LanguageResponseDto)
  secondaryLanguage?: LanguageResponseDto;

  @Expose()
  textNotificationsEnabled?: boolean;

  @Expose()
  notes?: string;

  @Expose()
  countryId?: string;

  @Expose()
  @Type(() => LocationResponseDto)
  country?: LocationResponseDto;

  @Expose()
  regionId?: string;

  @Expose()
  @Type(() => LocationResponseDto)
  region?: LocationResponseDto;

  @Expose()
  cityId?: string;

  @Expose()
  @Type(() => LocationResponseDto)
  city?: LocationResponseDto;

  @Expose()
  districtId?: string;

  @Expose()
  @Type(() => LocationResponseDto)
  district?: LocationResponseDto;

  @Expose()
  address?: string;

  @Expose()
  organizationId: string;

  @Expose()
  @Type(() => UserResponseDto)
  user?: UserResponseDto;

  @Expose()
  @Type(() => OrganizationResponseDto)
  organization?: OrganizationResponseDto;

  @Expose()
  @Type(() => ServiceTypeResponseDto)
  serviceTypes?: ServiceTypeResponseDto[];
}
