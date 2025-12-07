import { Module } from "@nestjs/common";
import { TitleModule } from "./title/title.module";
import { ServiceModule } from "./service/service.module";
import { LocationModule } from "./location/location.module";
import { LanguageModule } from "./language/language.module";
import { DepartmentModule } from "./department/department.module";
import { AppointmentTypeModule } from "./appointment-type/appointment-type.module";
import { AppointmentCancelTypeModule } from "./appointment-cancel-type/appointment-cancel-type.module";
import { LeaveTypeModule } from "./leave-type/leave-type.module";
import { HolidayModule } from "./holiday/holiday.module";

@Module({
  imports: [
    TitleModule,
    ServiceModule,
    LocationModule,
    LanguageModule,
    DepartmentModule,
    AppointmentTypeModule,
    AppointmentCancelTypeModule,
    LeaveTypeModule,
    HolidayModule,
  ],
  exports: [
    TitleModule,
    ServiceModule,
    LocationModule,
    LanguageModule,
    DepartmentModule,
    AppointmentTypeModule,
    AppointmentCancelTypeModule,
    LeaveTypeModule,
    HolidayModule,
  ],
})
export class MasterDataModule {}
