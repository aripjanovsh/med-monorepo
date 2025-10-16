import { Module } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { EmployeeController } from "./employee.controller";
import { RoleModule } from "../role/role.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [RoleModule, UserModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
