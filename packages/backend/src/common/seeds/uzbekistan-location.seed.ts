import { PrismaClient, LocationType } from "@prisma/client";
import { buildSearchTokens } from "../utils/transliteration.util";

export class UzbekistanLocationSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedUzbekistanLocations() {
    console.log("🗺️ Seeding Uzbekistan location data...");

    try {
      // 1. Create Uzbekistan country
      // For root locations (countries), we need to check by name only since parentId is null
      let uzbekistan = await this.prisma.location.findFirst({
        where: {
          name: "Узбекистан",
          parentId: null,
          type: LocationType.COUNTRY,
        },
      });

      if (!uzbekistan) {
        uzbekistan = await this.prisma.location.create({
          data: {
            name: "Узбекистан",
            code: "UZ",
            type: LocationType.COUNTRY,
            weight: 1,
            description:
              "Республика Узбекистан - государство в Центральной Азии",
            searchField: buildSearchTokens(["Узбекистан", "UZ"]),
            isActive: true,
          },
        });
      }

      console.log("✅ Created country: Узбекистан");
      // Ensure searchField is populated for existing country as well
      await this.prisma.location.update({
        where: { id: uzbekistan.id },
        data: {
          searchField: buildSearchTokens([
            uzbekistan.name,
            uzbekistan.code ?? undefined,
          ]),
        },
      });

      // 2. Create regions with correct hierarchy structure
      const regionsData = [
        // Республика Каракалпакстан
        {
          name: "Республика Каракалпакстан",
          code: "QR",
          type: LocationType.REGION,
          weight: 1,
          description: "Автономная республика в составе Узбекистана",
        },

        // Город Ташкент (специальный статус - город-регион)
        {
          name: "город Ташкент",
          code: "TK",
          type: LocationType.CITY,
          weight: 2,
          description: "Столица Республики Узбекистан",
        },

        // Области (Oblasts)
        {
          name: "Андижанская область",
          code: "AN",
          type: LocationType.REGION,
          weight: 3,
          description: "Область в восточной части Узбекистана",
        },
        {
          name: "Бухарская область",
          code: "BU",
          type: LocationType.REGION,
          weight: 4,
          description: "Область в центральной части Узбекистана",
        },
        {
          name: "Джизакская область",
          code: "DJ",
          type: LocationType.REGION,
          weight: 5,
          description: "Область в центральной части Узбекистана",
        },
        {
          name: "Кашкадарьинская область",
          code: "QA",
          type: LocationType.REGION,
          weight: 6,
          description: "Область в южной части Узбекистана",
        },
        {
          name: "Навоийская область",
          code: "NW",
          type: LocationType.REGION,
          weight: 7,
          description: "Область в центральной части Узбекистана",
        },
        {
          name: "Наманганская область",
          code: "NG",
          type: LocationType.REGION,
          weight: 8,
          description: "Область в восточной части Узбекистана",
        },
        {
          name: "Самаркандская область",
          code: "SA",
          type: LocationType.REGION,
          weight: 9,
          description: "Область в центральной части Узбекистана",
        },
        {
          name: "Сурхандарьинская область",
          code: "SU",
          type: LocationType.REGION,
          weight: 10,
          description: "Область в южной части Узбекистана",
        },
        {
          name: "Сырдарьинская область",
          code: "SI",
          type: LocationType.REGION,
          weight: 11,
          description: "Область в центральной части Узбекистана",
        },
        {
          name: "Ташкентская область",
          code: "TO",
          type: LocationType.REGION,
          weight: 12,
          description: "Область в северо-восточной части Узбекистана",
        },
        {
          name: "Ферганская область",
          code: "FA",
          type: LocationType.REGION,
          weight: 13,
          description: "Область в восточной части Узбекистана",
        },
        {
          name: "Хорезмская область",
          code: "XO",
          type: LocationType.REGION,
          weight: 14,
          description: "Область в западной части Узбекистана",
        },
      ];

      const createdRegions = new Map<string, any>();
      for (const regionData of regionsData) {
        let region = await this.prisma.location.findFirst({
          where: {
            name: regionData.name,
            parentId: uzbekistan.id,
            type: regionData.type,
          },
        });

        if (!region) {
          region = await this.prisma.location.create({
            data: {
              ...regionData,
              parentId: uzbekistan.id,
              searchField: buildSearchTokens([
                regionData.name,
                regionData.code,
                uzbekistan.name,
              ]),
              isActive: true,
            },
          });
        }

        // Ensure searchField is populated/updated
        await this.prisma.location.update({
          where: { id: region.id },
          data: {
            searchField: buildSearchTokens([
              region.name,
              region.code ?? undefined,
              uzbekistan.name,
            ]),
          },
        });

        createdRegions.set(regionData.name, region);
        console.log(`✅ Created region: ${regionData.name}`);
      }

      // 3. Create districts for "город Ташкент" (directly under region)
      const tashkentRegion = createdRegions.get("город Ташкент");
      if (tashkentRegion) {
        const tashkentDistricts = [
          {
            name: "Алмазарский район",
            code: "ALM",
            weight: 1,
            description: "Район в городе Ташкент",
          },
          {
            name: "Бектемирский район",
            code: "BEK",
            weight: 2,
            description: "Район в городе Ташкент",
          },
          {
            name: "Мирабадский район",
            code: "MIR",
            weight: 3,
            description: "Район в городе Ташкент",
          },
          {
            name: "Мирзо-Улугбекский район",
            code: "MUL",
            weight: 4,
            description: "Район в городе Ташкент",
          },
          {
            name: "Сергелийский район",
            code: "SER",
            weight: 5,
            description: "Район в городе Ташкент",
          },
          {
            name: "Учтепинский район",
            code: "UCH",
            weight: 6,
            description: "Район в городе Ташкент",
          },
          {
            name: "Чиланзарский район",
            code: "CHI",
            weight: 7,
            description: "Район в городе Ташкент",
          },
          {
            name: "Шайхантахурский район",
            code: "SHA",
            weight: 8,
            description: "Район в городе Ташкент",
          },
          {
            name: "Юнусабадский район",
            code: "YUN",
            weight: 9,
            description: "Район в городе Ташкент",
          },
          {
            name: "Яккасарайский район",
            code: "YAK",
            weight: 10,
            description: "Район в городе Ташкент",
          },
          {
            name: "Яшнабадский район",
            code: "YAS",
            weight: 11,
            description: "Район в городе Ташкент",
          },
          {
            name: "Зангиатинский район",
            code: "ZAN",
            weight: 12,
            description: "Район в городе Ташкент",
          },
        ];

        for (const districtData of tashkentDistricts) {
          let district = await this.prisma.location.findFirst({
            where: {
              name: districtData.name,
              parentId: tashkentRegion.id,
              type: LocationType.DISTRICT,
            },
          });

          if (!district) {
            district = await this.prisma.location.create({
              data: {
                ...districtData,
                type: LocationType.DISTRICT,
                parentId: tashkentRegion.id,
                searchField: buildSearchTokens([
                  districtData.name,
                  districtData.code,
                  tashkentRegion.name,
                ]),
                isActive: true,
              },
            });
          }
          // Ensure searchField for existing district
          await this.prisma.location.update({
            where: { id: district.id },
            data: {
              searchField: buildSearchTokens([
                district.name,
                district.code ?? undefined,
                tashkentRegion.name,
              ]),
            },
          });
          console.log(`✅ Created district: ${districtData.name}`);
        }
      }

      // 4. Create cities for other regions (oblast structure: Region -> City -> District)
      const citiesData = [
        // Андижанская область
        {
          regionName: "Андижанская область",
          cities: [
            {
              name: "город Андижан",
              code: "AND",
              weight: 1,
              description: "Административный центр Андижанской области",
            },
            {
              name: "город Ханабад",
              code: "HAN",
              weight: 2,
              description: "Город в Андижанской области",
            },
          ],
        },
        // Ташкентская область
        {
          regionName: "Ташкентская область",
          cities: [
            {
              name: "город Чирчик",
              code: "CHR",
              weight: 1,
              description: "Город в Ташкентской области",
            },
            {
              name: "город Ангрен",
              code: "ANG",
              weight: 2,
              description: "Город в Ташкентской области",
            },
          ],
        },
        // Самаркандская область
        {
          regionName: "Самаркандская область",
          cities: [
            {
              name: "город Самарканд",
              code: "SAM",
              weight: 1,
              description: "Административный центр Самаркандской области",
            },
          ],
        },
      ];

      const createdCities = new Map<string, any>();
      for (const regionData of citiesData) {
        const region = createdRegions.get(regionData.regionName);
        if (region) {
          for (const cityData of regionData.cities) {
            let city = await this.prisma.location.findFirst({
              where: {
                name: cityData.name,
                parentId: region.id,
                type: LocationType.CITY,
              },
            });

            if (!city) {
              city = await this.prisma.location.create({
                data: {
                  ...cityData,
                  type: LocationType.CITY,
                  parentId: region.id,
                  searchField: buildSearchTokens([
                    cityData.name,
                    cityData.code,
                    region.name,
                  ]),
                  isActive: true,
                },
              });
            }

            createdCities.set(
              `${regionData.regionName}-${cityData.name}`,
              city,
            );
            console.log(
              `✅ Created city: ${cityData.name} in ${regionData.regionName}`,
            );

            // Ensure searchField for existing city
            await this.prisma.location.update({
              where: { id: city.id },
              data: {
                searchField: buildSearchTokens([
                  city.name,
                  city.code ?? undefined,
                  region.name,
                ]),
              },
            });
          }
        }
      }

      // 5. Create some sample districts for cities in oblasts
      const districtsData = [
        // Андижанская область -> город Андижан
        {
          cityKey: "Андижанская область-город Андижан",
          districts: [
            {
              name: "Алтынкульский район",
              code: "ALT",
              weight: 1,
              description: "Район в городе Андижан",
            },
            {
              name: "Центральный район",
              code: "CEN",
              weight: 2,
              description: "Центральный район города Андижан",
            },
          ],
        },
        // Ташкентская область -> город Чирчик
        {
          cityKey: "Ташкентская область-город Чирчик",
          districts: [
            {
              name: "Бустанлыкский район",
              code: "BUS",
              weight: 1,
              description: "Район в Ташкентской области",
            },
          ],
        },
      ];

      for (const cityData of districtsData) {
        const city = createdCities.get(cityData.cityKey);
        if (city) {
          for (const districtData of cityData.districts) {
            let district = await this.prisma.location.findFirst({
              where: {
                name: districtData.name,
                parentId: city.id,
                type: LocationType.DISTRICT,
              },
            });

            if (!district) {
              district = await this.prisma.location.create({
                data: {
                  ...districtData,
                  type: LocationType.DISTRICT,
                  parentId: city.id,
                  searchField: buildSearchTokens([
                    districtData.name,
                    districtData.code,
                    city.name,
                  ]),
                  isActive: true,
                },
              });
            }
            console.log(
              `✅ Created district: ${districtData.name} in ${city.name}`,
            );
            // Ensure searchField for existing district
            await this.prisma.location.update({
              where: { id: district.id },
              data: {
                searchField: buildSearchTokens([
                  district.name,
                  district.code ?? undefined,
                  city.name,
                ]),
              },
            });
          }
        }
      }

      console.log("✅ Uzbekistan location data seeded successfully!");

      return {
        country: uzbekistan,
        regionsCount: regionsData.length,
        tashkentDistrictsCount: 12,
        citiesCount: createdCities.size,
        otherDistrictsCount: 3,
      };
    } catch (error) {
      console.error("❌ Error seeding Uzbekistan location data:", error);
      throw error;
    }
  }
}
