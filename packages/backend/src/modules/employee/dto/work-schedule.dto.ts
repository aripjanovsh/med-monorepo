import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsObject,
  ValidateNested,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";

class WorkScheduleTimeSlotDto {
  @ApiProperty({
    description: "Work schedule time slot from",
    example: "09:00",
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: "Work schedule time slot to",
    example: "18:00",
  })
  @IsString()
  to: string;
}

export class WorkScheduleDto {
  @ApiProperty({
    description: "Work schedule for Monday",
    example: {
      from: "09:00",
      to: "18:00",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkScheduleTimeSlotDto)
  monday?: WorkScheduleTimeSlotDto | null;

  @ApiProperty({
    description: "Work schedule for Tuesday",
    example: {
      from: "09:00",
      to: "18:00",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkScheduleTimeSlotDto)
  tuesday?: WorkScheduleTimeSlotDto | null;

  @ApiProperty({
    description: "Work schedule for Wednesday",
    example: {
      from: "09:00",
      to: "18:00",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkScheduleTimeSlotDto)
  wednesday?: WorkScheduleTimeSlotDto | null;

  @ApiProperty({
    description: "Work schedule for Thursday",
    example: {
      from: "09:00",
      to: "18:00",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkScheduleTimeSlotDto)
  thursday?: WorkScheduleTimeSlotDto | null;

  @ApiProperty({
    description: "Work schedule for Friday",
    example: {
      from: "09:00",
      to: "18:00",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkScheduleTimeSlotDto)
  friday?: WorkScheduleTimeSlotDto | null;

  @ApiProperty({
    description: "Work schedule for Saturday",
    example: {
      from: "09:00",
      to: "18:00",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkScheduleTimeSlotDto)
  saturday?: WorkScheduleTimeSlotDto | null;

  @ApiProperty({
    description: "Work schedule for Sunday",
    example: {
      from: "09:00",
      to: "18:00",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkScheduleTimeSlotDto)
  sunday?: WorkScheduleTimeSlotDto | null;
}
