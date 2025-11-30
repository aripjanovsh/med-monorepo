import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class GenderDistributionDto {
  @Expose()
  @ApiProperty({ description: "Number of male patients" })
  male: number;

  @Expose()
  @ApiProperty({ description: "Number of female patients" })
  female: number;

  @Expose()
  @ApiProperty({ description: "Percentage of male patients" })
  malePercent: number;

  @Expose()
  @ApiProperty({ description: "Percentage of female patients" })
  femalePercent: number;
}

@Exclude()
export class AgeGroupDto {
  @Expose()
  @ApiProperty({ description: "Age group label" })
  label: string;

  @Expose()
  @ApiProperty({ description: "Age range start" })
  minAge: number;

  @Expose()
  @ApiProperty({ description: "Age range end (null for no upper limit)" })
  maxAge: number | null;

  @Expose()
  @ApiProperty({ description: "Number of patients in this age group" })
  count: number;

  @Expose()
  @ApiProperty({ description: "Percentage of patients in this age group" })
  percent: number;
}

@Exclude()
export class MonthlyTrendDto {
  @Expose()
  @ApiProperty({ description: "Month label (e.g., 'Январь')" })
  month: string;

  @Expose()
  @ApiProperty({ description: "Short month label (e.g., 'Янв')" })
  monthShort: string;

  @Expose()
  @ApiProperty({ description: "Year" })
  year: number;

  @Expose()
  @ApiProperty({ description: "Number of new patients registered this month" })
  newPatients: number;

  @Expose()
  @ApiProperty({ description: "Total visits this month" })
  visits: number;
}

@Exclude()
export class PatientStatsResponseDto {
  @Expose()
  @ApiProperty({ description: "Total number of patients" })
  totalPatients: number;

  @Expose()
  @ApiProperty({ description: "Number of active patients" })
  activePatients: number;

  @Expose()
  @ApiProperty({ description: "Number of new patients this month" })
  newPatientsThisMonth: number;

  @Expose()
  @ApiProperty({ description: "Number of new patients last month" })
  newPatientsLastMonth: number;

  @Expose()
  @ApiProperty({ description: "Growth percentage compared to last month" })
  growthPercent: number;

  @Expose()
  @Type(() => GenderDistributionDto)
  @ApiProperty({
    description: "Gender distribution statistics",
    type: GenderDistributionDto,
  })
  genderDistribution: GenderDistributionDto;

  @Expose()
  @Type(() => AgeGroupDto)
  @ApiProperty({
    description: "Age group distribution",
    type: [AgeGroupDto],
  })
  ageDistribution: AgeGroupDto[];

  @Expose()
  @ApiProperty({ description: "Number of patients with repeat visits" })
  returningPatients: number;

  @Expose()
  @ApiProperty({ description: "Percentage of returning patients" })
  returningPatientsPercent: number;

  @Expose()
  @Type(() => MonthlyTrendDto)
  @ApiProperty({
    description: "Monthly registration trends (last 6 months)",
    type: [MonthlyTrendDto],
  })
  monthlyTrends: MonthlyTrendDto[];
}
