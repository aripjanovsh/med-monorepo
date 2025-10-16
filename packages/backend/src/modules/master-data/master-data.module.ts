import { Module } from "@nestjs/common";
import { TitleModule } from "./title/title.module";
import { ServiceTypeModule } from "./service-type/service-type.module";
import { LocationModule } from "./location/location.module";
import { LanguageModule } from "./language/language.module";
import { RoleModule } from "../role/role.module";

// Note: Replaced CountryModule, RegionModule, CityModule, DistrictModule with unified LocationModule

@Module({
  imports: [TitleModule, ServiceTypeModule, LocationModule, LanguageModule],
  exports: [TitleModule, ServiceTypeModule, LocationModule, LanguageModule],
})
export class MasterDataModule {}
