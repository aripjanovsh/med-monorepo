# Database Migration Instructions

## Добавление поля templateType к ProtocolTemplate

### Шаг 1: Создание миграции

```bash
cd packages/backend
npx prisma migrate dev --name add_template_type_to_protocol_templates
```

Эта команда создаст новую миграцию в папке `prisma/migrations/`

### Шаг 2: Проверка миграции

Prisma автоматически создаст SQL файл примерно такого содержания:

```sql
-- AlterTable
ALTER TABLE "protocol_templates" 
ADD COLUMN "templateType" TEXT NOT NULL DEFAULT 'richtext';
```

### Шаг 3: Применение миграции

Миграция автоматически применится после запуска команды `migrate dev`.

Для production окружения:

```bash
npx prisma migrate deploy
```

### Шаг 4: Генерация Prisma Client

```bash
npx prisma generate
```

### Шаг 5: Обновление backend кода

Обновите DTO и сервисы для работы с новым полем `templateType`.

#### protocol-template.dto.ts

```typescript
export class CreateProtocolTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsIn(['richtext', 'formbuilder'])
  @IsNotEmpty()
  templateType: 'richtext' | 'formbuilder';
}

export class UpdateProtocolTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  // templateType не должен обновляться после создания
  // @IsString()
  // @IsIn(['richtext', 'formbuilder'])
  // @IsOptional()
  // templateType?: 'richtext' | 'formbuilder';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

#### protocol-template.service.ts

```typescript
async create(dto: CreateProtocolTemplateDto, userId: string, organizationId: string) {
  // Валидация content в зависимости от templateType
  if (dto.templateType === 'formbuilder') {
    this.validateFormBuilderContent(dto.content);
  }

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

private validateFormBuilderContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    
    if (!parsed.version || !Array.isArray(parsed.sections)) {
      throw new BadRequestException('Invalid FormBuilder content structure');
    }

    // Дополнительная валидация...
  } catch (error) {
    throw new BadRequestException('Invalid FormBuilder JSON content');
  }
}
```

### Проверка

После применения миграции проверьте:

```bash
# Проверка статуса миграций
npx prisma migrate status

# Проверка схемы в базе данных
npx prisma studio
```

### Откат (если нужно)

Если требуется откат миграции:

```bash
# НЕ рекомендуется для production
# Вместо этого создайте новую миграцию для удаления поля

npx prisma migrate dev --name remove_template_type
```

И в новой миграции:

```sql
ALTER TABLE "protocol_templates" 
DROP COLUMN "templateType";
```
