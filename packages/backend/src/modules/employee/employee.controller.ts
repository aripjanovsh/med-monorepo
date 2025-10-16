import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { FindAllEmployeeDto } from "./dto/find-all-employee.dto";
import { EmployeeByIdDto } from "./dto/employee-by-id.dto";
import { UpdateEmployeeStatusDto } from "./dto/update-employee-status.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../../common/decorators/current-user.decorator";

@ApiTags("Employees")
@Controller("employees")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @RequirePermission({ resource: "employees", action: "CREATE" })
  @ApiOperation({ summary: "Create new employee" })
  @ApiResponse({ status: 201, description: "Employee created successfully" })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @RequirePermission({ resource: "employees", action: "READ" })
  @ApiOperation({ summary: "Get all employees with pagination" })
  @ApiResponse({ status: 200, description: "Employees retrieved successfully" })
  findAll(@Query() query: FindAllEmployeeDto) {
    return this.employeeService.findAll(query);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get employee statistics" })
  @ApiResponse({
    status: 200,
    description: "Employee statistics retrieved successfully",
  })
  getStats(@Query() query: FindAllEmployeeDto) {
    return this.employeeService.getEmployeeStats(query.organizationId);
  }

  @Get(":id")
  @RequirePermission({ resource: "employees", action: "READ" })
  @ApiOperation({ summary: "Get employee by ID" })
  @ApiResponse({ status: 200, description: "Employee found" })
  @ApiResponse({ status: 404, description: "Employee not found" })
  findOne(@Param("id") id: string, @Query() query: EmployeeByIdDto) {
    return this.employeeService.findById(id, query.organizationId);
  }

  @Patch(":id")
  @RequirePermission({ resource: "employees", action: "UPDATE" })
  @ApiOperation({ summary: "Update employee" })
  @ApiResponse({ status: 200, description: "Employee updated successfully" })
  @ApiResponse({ status: 404, description: "Employee not found" })
  @ApiResponse({ status: 409, description: "Employee ID already exists" })
  update(
    @Param("id") id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Patch(":id/status")
  @RequirePermission({ resource: "employees", action: "UPDATE" })
  @ApiOperation({ summary: "Update employee status" })
  @ApiResponse({
    status: 200,
    description: "Employee status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Employee not found" })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateEmployeeStatusDto,
  ) {
    return this.employeeService.updateStatus(
      id,
      updateStatusDto.status,
      updateStatusDto.organizationId,
    );
  }

  @Delete(":id")
  @RequirePermission({ resource: "employees", action: "DELETE" })
  @ApiOperation({ summary: "Delete employee" })
  @ApiResponse({ status: 200, description: "Employee deleted successfully" })
  @ApiResponse({ status: 404, description: "Employee not found" })
  remove(@Param("id") id: string, @Query() query: EmployeeByIdDto) {
    return this.employeeService.remove(id, query.organizationId);
  }
}
