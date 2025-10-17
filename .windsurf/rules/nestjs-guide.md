---
trigger: model_decision
description: This document outlines the architectural patterns, best practices, and coding standards for the NestJS backend application. Follow these guidelines to maintain consistency and code quality throughout the project.
---

# NestJS Backend Development Guidelines

This document outlines the architectural patterns, best practices, and coding standards for the NestJS backend application. Follow these guidelines to maintain consistency and code quality throughout the project.

## 1. Module Structure

Each module should follow this structure:

```
modules/
  ├── [module-name]/
  │   ├── dto/
  │   │   ├── create-[module-name].dto.ts
  │   │   ├── update-[module-name].dto.ts
  │   │   ├── find-all-[module-name].dto.ts
  │   │   ├── [module-name]-response.dto.ts
  │   │   └── [additional-dtos].dto.ts
  │   ├── [module-name].controller.ts
  │   ├── [module-name].service.ts
  │   └── [module-name].module.ts
```

## 2. Multi-tenancy with organizationId

### Automatic organizationId Injection

All DTOs that require multi-tenancy support **MUST** use the `@InjectOrganizationId()` decorator:

```typescript
import { Expose } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export class CreateEmployeeDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  // ... other fields
}
```

### Key Points:

- **ALWAYS** use `@Expose()` before `@InjectOrganizationId()`
- The decorator automatically assigns `organizationId` based on:
  - For SUPER_ADMIN: Uses value from DTO or `x-organization-id` header
  - For regular users: Uses user's `organizationId` from JWT token
- **NEVER** manually validate or assign `organizationId` in services
- Include `organizationId` in `FindAll`, `Update`, and query DTOs for tenant isolation

## 3. DTO Best Practices

### DTO Transformation Philosophy

All data transformations **MUST** happen in DTOs. Services should receive clean, validated, and transformed data ready for Prisma.

#### Create DTO Pattern

```typescript
import { Expose, Exclude, Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsDateString, IsUUID } from "class-validator";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { TransformEmpty, TransformDate } from "@/common/decorators";

@Exclude()
export class CreateEmployeeDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "First name", example: "John" })
  @IsString()
  firstName: string;

  @Expose()
  @ApiProperty({ description: "Date of birth", required: false })
  @IsOptional()
  @IsDateString()
  @TransformDate()
  dateOfBirth?: Date;

  @Expose()
  @ApiProperty({ description: "Title ID", required: false })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  titleId?: string;
}
```

#### Response DTO Pattern

```typescript
import { Expose, Exclude, Type } from "class-transformer";
import { BaseResponseDto } from "@/common/dto/response.dto";
import { TransformDecimal } from "@/common/decorators/transform-decimal.decorator";
import { SafeDecimal } from "@/common/types";

@Exclude()
export class EmployeeResponseDto extends BaseResponseDto {
  @Expose()
  employeeId: string;

  @Expose()
  firstName: string;

  @Expose()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  salary?: number;

  @Expose()
  @Type(() => TitleResponseDto)
  title?: TitleResponseDto;

  @Expose()
  @Type(() => OrganizationResponseDto)
  organization?: OrganizationResponseDto;
}
```

### DTO Rules:

1. **ALWAYS** use `@Exclude()` at class level and `@Expose()` for each field
2. **ALWAYS** add `@ApiProperty()` or `@ApiPropertyOptional()` for Swagger documentation
3. Use custom transformers (`@TransformEmpty()`, `@TransformDate()`, `@TransformDecimal()`)
4. Use `@Type()` decorator for nested objects
5. Extend `BaseResponseDto` for all response DTOs
6. Use `plainToInstance()` in services to transform Prisma results

## 4. Service Layer Architecture

### Service Method Pattern

Services should be clean and focused on business logic. All transformations happen in DTOs.

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { Prisma } from "@prisma/client";

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    return await this.prisma.$transaction(async (tx) => {
      const { serviceTypeIds, ...employeeCore } = dto;

      // Direct pass to Prisma - all transformations done in DTO
      const created = await tx.employee.create({
        data: {
          ...employeeCore,
          employeeId: employeeId ?? generateMemorableId("EMP"),
        },
      });

      // Handle relations
      if (serviceTypeIds?.length > 0) {
        await tx.employeeServiceType.createMany({
          data: serviceTypeIds.map((serviceTypeId) => ({
            employeeId: created.id,
            serviceTypeId,
          })),
          skipDuplicates: true,
        });
      }

      // Fetch with relations
      const result = await tx.employee.findUnique({
        where: { id: created.id },
        include: {
          organization: true,
          title: true,
          serviceTypes: { include: { serviceType: true } },
        },
      });

      // Transform nested relations if needed
      const response = {
        ...result,
        serviceTypes: result.serviceTypes.map((st) => st.serviceType),
      };

      return plainToInstance(EmployeeResponseDto, response);
    });
  }

  async findAll(query: FindAllDto): Promise<PaginatedResponseDto<ResponseDto>> {
    const { page, limit, search, sortBy, sortOrder, organizationId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {
      organizationId, // Already validated and injected by decorator
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.EmployeeOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: { organization: true, title: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: plainToInstance(EmployeeResponseDto, data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, dto: UpdateDto): Promise<ResponseDto> {
    // Check existence first
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Employee not found");
    }

    return await this.prisma.$transaction(async (tx) => {
      const where: Prisma.EmployeeWhereUniqueInput = {
        id,
        organizationId: dto.organizationId, // Tenant isolation
      };

      const { relatedIds, ...coreUpdate } = dto;

      await tx.employee.update({
        where,
        data: coreUpdate,
      });

      // Handle relations updates...

      const updated = await tx.employee.findUnique({
        where: { id },
        include: { organization: true },
      });

      return plainToInstance(EmployeeResponseDto, updated);
    });
  }

  async remove(
    id: string,
    organizationId?: string
  ): Promise<{ message: string }> {
    try {
      const where: Prisma.EmployeeWhereUniqueInput = { id };
      if (organizationId) {
        where.organizationId = organizationId;
      }

      await this.prisma.employee.delete({ where });
      return { message: "Employee deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Employee not found");
        }
      }
      throw error;
    }
  }
}
```

### Service Layer Rules:

1. **NEVER** perform data transformations in services - do it in DTOs
2. **ALWAYS** use `plainToInstance()` to transform Prisma results to Response DTOs
3. Use `$transaction` for operations that modify multiple tables
4. Include `organizationId` in `where` clauses for tenant isolation
5. Handle Prisma errors explicitly (check for `P2025`, `P2002`, etc.)
6. Use `Promise.all()` for parallel operations that don't depend on each other
7. Fetch relations in a single query using `include` rather than multiple queries

## 5. Controller Best Practices

### Controller Method Pattern

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";

@ApiTags("Employees")
@Controller("employees")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  @Post()
  @RequirePermission({ resource: "employees", action: "CREATE" })
  @ApiOperation({ summary: "Create new employee" })
  @ApiResponse({ status: 201, description: "Employee created successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  create(@Body() dto: CreateEmployeeDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermission({ resource: "employees", action: "READ" })
  @ApiOperation({ summary: "Get all employees with pagination" })
  @ApiResponse({ status: 200, description: "Employees retrieved successfully" })
  findAll(@Query() query: FindAllEmployeeDto) {
    return this.service.findAll(query);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get employee statistics" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  getStats(@Query() query: FindAllEmployeeDto) {
    return this.service.getEmployeeStats(query.organizationId);
  }

  @Get(":id")
  @RequirePermission({ resource: "employees", action: "READ" })
  @ApiOperation({ summary: "Get employee by ID" })
  @ApiResponse({ status: 200, description: "Employee found" })
  @ApiResponse({ status: 404, description: "Employee not found" })
  findOne(@Param("id") id: string, @Query() query: EmployeeByIdDto) {
    return this.service.findById(id, query.organizationId);
  }

  @Patch(":id")
  @RequirePermission({ resource: "employees", action: "UPDATE" })
  @ApiOperation({ summary: "Update employee" })
  @ApiResponse({ status: 200, description: "Employee updated successfully" })
  @ApiResponse({ status: 404, description: "Employee not found" })
  update(@Param("id") id: string, @Body() dto: UpdateEmployeeDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @RequirePermission({ resource: "employees", action: "DELETE" })
  @ApiOperation({ summary: "Delete employee" })
  @ApiResponse({ status: 200, description: "Employee deleted successfully" })
  @ApiResponse({ status: 404, description: "Employee not found" })
  remove(@Param("id") id: string, @Query() query: EmployeeByIdDto) {
    return this.service.remove(id, query.organizationId);
  }
}
```

### Controller Rules:

1. Use `@ApiTags()` at class level for grouping in Swagger
2. **ALWAYS** add `@ApiOperation()` and `@ApiResponse()` for each endpoint
3. Use guards (`AuthGuard`, `PermissionGuard`) for authorization
4. Use `@ApiBearerAuth()` when JWT is required
5. Controller methods should be thin - only pass data to service
6. Use descriptive route names (prefer `employees/stats` over `employees/get-stats`)
7. Place specific routes before parameterized routes (`:id`)
8. Return service results directly - no transformations in controller

#
