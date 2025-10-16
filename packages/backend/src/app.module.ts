import { Module, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./common/prisma/prisma.module";
import { ValidationModule } from "./common/validation/validation.module";
import { TenantModule } from "./common/tenant/tenant.module";
import { RequestContextMiddleware } from "./common/middleware/request-context.middleware";
import { RequestContextService } from "./common/context/request-context.service";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { UserModule } from "./modules/user/user.module";
import { EmployeeModule } from "./modules/employee/employee.module";
import { PatientModule } from "./modules/patient/patient.module";
import { RoleModule } from "./modules/role/role.module";
import { MasterDataModule } from "./modules/master-data/master-data.module";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    ValidationModule,
    TenantModule,
    AuthModule,
    OrganizationModule,
    UserModule,
    EmployeeModule,
    PatientModule,
    RoleModule,
    MasterDataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RequestContextService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
