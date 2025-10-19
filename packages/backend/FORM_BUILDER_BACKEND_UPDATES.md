# Backend Updates for Form Builder Support

Необходимые обновления backend для поддержки Form Builder.

## 1. DTO Updates

### src/modules/protocol-template/dto/create-protocol-template.dto.ts

```typescript
import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProtocolTemplateDto {
  @ApiProperty({
    description: 'Название протокола',
    example: 'Протокол приёма терапевта',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Описание протокола',
    example: 'Стандартный протокол первичного приёма',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Тип шаблона протокола',
    enum: ['richtext', 'formbuilder'],
    example: 'formbuilder',
  })
  @IsString()
  @IsIn(['richtext', 'formbuilder'])
  @IsNotEmpty()
  templateType: 'richtext' | 'formbuilder';

  @ApiProperty({
    description: 'Содержимое протокола в формате JSON',
    example: '{"version":1,"sections":[]}',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
```

### src/modules/protocol-template/dto/update-protocol-template.dto.ts

```typescript
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProtocolTemplateDto {
  @ApiPropertyOptional({
    description: 'Название протокола',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Описание протокола',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Содержимое протокола в формате JSON',
  })
  @IsString()
  @IsOptional()
  content?: string;

  // Примечание: templateType НЕ должен обновляться после создания
  // Если требуется изменить тип, нужно создать новый шаблон

  @ApiPropertyOptional({
    description: 'Статус активности протокола',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

## 2. Service Updates

### src/modules/protocol-template/protocol-template.service.ts

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProtocolTemplateDto } from './dto/create-protocol-template.dto';
import { UpdateProtocolTemplateDto } from './dto/update-protocol-template.dto';

@Injectable()
export class ProtocolTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateProtocolTemplateDto,
    userId: string,
    organizationId: string,
  ) {
    // Валидация content в зависимости от типа
    this.validateContent(dto.content, dto.templateType);

    return this.prisma.protocolTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        content: dto.content,
        templateType: dto.templateType,
        organizationId,
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdateProtocolTemplateDto, userId: string) {
    // Получаем существующий шаблон
    const template = await this.prisma.protocolTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new BadRequestException('Protocol template not found');
    }

    // Если обновляется content, валидируем его
    if (dto.content) {
      this.validateContent(dto.content, template.templateType);
    }

    return this.prisma.protocolTemplate.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  private validateContent(content: string, templateType: string) {
    try {
      const parsed = JSON.parse(content);

      if (templateType === 'formbuilder') {
        this.validateFormBuilderContent(parsed);
      }
      // richtext валидация может быть добавлена при необходимости
    } catch (error) {
      throw new BadRequestException('Invalid JSON content');
    }
  }

  private validateFormBuilderContent(content: any) {
    // Проверка базовой структуры
    if (!content.version || typeof content.version !== 'number') {
      throw new BadRequestException('FormBuilder content must have a version');
    }

    if (!Array.isArray(content.sections)) {
      throw new BadRequestException(
        'FormBuilder content must have sections array',
      );
    }

    // Проверка секций
    const sectionIds = new Set<string>();
    for (const section of content.sections) {
      if (!section.id || !section.title) {
        throw new BadRequestException('Each section must have id and title');
      }

      if (sectionIds.has(section.id)) {
        throw new BadRequestException(
          `Duplicate section id: ${section.id}`,
        );
      }
      sectionIds.add(section.id);

      if (!Array.isArray(section.fields)) {
        throw new BadRequestException('Each section must have fields array');
      }

      // Проверка полей
      const fieldIds = new Set<string>();
      for (const field of section.fields) {
        if (!field.id || !field.label || !field.type) {
          throw new BadRequestException(
            'Each field must have id, label, and type',
          );
        }

        if (fieldIds.has(field.id)) {
          throw new BadRequestException(`Duplicate field id: ${field.id}`);
        }
        fieldIds.add(field.id);

        // Проверка что для select/radio/tags есть options
        if (['select', 'radio', 'tags'].includes(field.type)) {
          if (!field.options || !Array.isArray(field.options)) {
            throw new BadRequestException(
              `Field ${field.id} of type ${field.type} must have options array`,
            );
          }
        }
      }
    }
  }

  async findAll(organizationId: string, query: any) {
    const { page = 1, limit = 10, search, isActive, templateType } = query;

    const where = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
      ...(templateType && { templateType }),
    };

    const [items, total] = await Promise.all([
      this.prisma.protocolTemplate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.protocolTemplate.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, organizationId: string) {
    const template = await this.prisma.protocolTemplate.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new BadRequestException('Protocol template not found');
    }

    return template;
  }

  async remove(id: string, organizationId: string) {
    const template = await this.findOne(id, organizationId);

    // Soft delete - просто деактивируем
    return this.prisma.protocolTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
```

## 3. Controller Updates

### src/modules/protocol-template/protocol-template.controller.ts

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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProtocolTemplateService } from './protocol-template.service';
import { CreateProtocolTemplateDto } from './dto/create-protocol-template.dto';
import { UpdateProtocolTemplateDto } from './dto/update-protocol-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('protocol-templates')
@Controller('protocol-templates')
@UseGuards(JwtAuthGuard)
export class ProtocolTemplateController {
  constructor(
    private readonly protocolTemplateService: ProtocolTemplateService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create protocol template' })
  @ApiResponse({ status: 201, description: 'Protocol template created' })
  create(
    @Body() createDto: CreateProtocolTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.protocolTemplateService.create(
      createDto,
      user.id,
      user.organizationId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all protocol templates' })
  findAll(@Query() query: any, @CurrentUser() user: User) {
    return this.protocolTemplateService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get protocol template by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.protocolTemplateService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update protocol template' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProtocolTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.protocolTemplateService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete protocol template' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.protocolTemplateService.remove(id, user.organizationId);
  }
}
```

## 4. Query DTO (Optional)

### src/modules/protocol-template/dto/query-protocol-template.dto.ts

```typescript
import { IsOptional, IsString, IsBoolean, IsIn, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProtocolTemplateDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by template type',
    enum: ['richtext', 'formbuilder'],
  })
  @IsString()
  @IsIn(['richtext', 'formbuilder'])
  @IsOptional()
  templateType?: 'richtext' | 'formbuilder';
}
```

## 5. Testing

### protocol-template.service.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProtocolTemplateService } from './protocol-template.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProtocolTemplateService', () => {
  let service: ProtocolTemplateService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProtocolTemplateService, PrismaService],
    }).compile();

    service = module.get<ProtocolTemplateService>(ProtocolTemplateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a richtext template', async () => {
      const dto = {
        name: 'Test Template',
        description: 'Test Description',
        templateType: 'richtext' as const,
        content: '{"content":"test"}',
      };

      const result = await service.create(dto, 'userId', 'orgId');
      expect(result).toBeDefined();
      expect(result.templateType).toBe('richtext');
    });

    it('should create a formbuilder template', async () => {
      const dto = {
        name: 'Test Template',
        description: 'Test Description',
        templateType: 'formbuilder' as const,
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: 'section1',
              title: 'Section 1',
              fields: [
                {
                  id: 'field1',
                  type: 'text',
                  label: 'Field 1',
                },
              ],
            },
          ],
        }),
      };

      const result = await service.create(dto, 'userId', 'orgId');
      expect(result).toBeDefined();
      expect(result.templateType).toBe('formbuilder');
    });

    it('should throw error for invalid formbuilder content', async () => {
      const dto = {
        name: 'Test Template',
        description: 'Test Description',
        templateType: 'formbuilder' as const,
        content: '{"invalid":"content"}',
      };

      await expect(service.create(dto, 'userId', 'orgId')).rejects.toThrow();
    });
  });
});
```

## 6. Swagger Documentation

Swagger автоматически сгенерирует документацию из декораторов. Доступно по адресу:
```
http://localhost:3000/api/docs
```

## Checklist

- [ ] DTO созданы и валидируются
- [ ] Service методы обновлены
- [ ] Валидация FormBuilder контента реализована
- [ ] Controller endpoints обновлены
- [ ] Unit тесты написаны
- [ ] Integration тесты написаны
- [ ] Swagger документация обновлена
- [ ] Error handling реализован
- [ ] Logging добавлен
