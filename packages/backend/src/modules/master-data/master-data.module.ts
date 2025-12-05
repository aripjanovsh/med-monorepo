import { Module } from "@nestjs/common";
import { TitleModule } from "./title/title.module";
import { ServiceModule } from "./service/service.module";
import { LocationModule } from "./location/location.module";
import { LanguageModule } from "./language/language.module";
import { DepartmentModule } from "./department/department.module";

@Module({
  imports: [
    TitleModule,
    ServiceModule,
    LocationModule,
    LanguageModule,
    DepartmentModule,
  ],
  exports: [
    TitleModule,
    ServiceModule,
    LocationModule,
    LanguageModule,
    DepartmentModule,
  ],
})
export class MasterDataModule {}
