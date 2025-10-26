import { Module } from "@nestjs/common";
import { TitleModule } from "./title/title.module";
import { ServiceTypeModule } from "./service-type/service-type.module";
import { ServiceModule } from "./service/service.module";
import { LocationModule } from "./location/location.module";
import { LanguageModule } from "./language/language.module";
import { DepartmentModule } from "./department/department.module";
import { RoleModule } from "../role/role.module";

// Note: Replaced CountryModule, RegionModule, CityModule, DistrictModule with unified LocationModule

@Module({
  imports: [
    TitleModule,
    ServiceTypeModule,
    ServiceModule,
    LocationModule,
    LanguageModule,
    DepartmentModule,
  ],
  exports: [
    TitleModule,
    ServiceTypeModule,
    ServiceModule,
    LocationModule,
    LanguageModule,
    DepartmentModule,
  ],
})
export class MasterDataModule {}
