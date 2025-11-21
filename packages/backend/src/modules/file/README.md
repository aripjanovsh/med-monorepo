# File Management Module

Модуль для загрузки, хранения и управления файлами различных типов.

## Установка зависимостей

```bash
cd packages/backend
npm install multer sharp @nestjs/platform-express
npm install --save-dev @types/multer
```

## Структура

```
file/
├── dto/
│   ├── upload-file.dto.ts
│   ├── file-response.dto.ts
│   ├── file-query.dto.ts
│   ├── update-file.dto.ts
│   ├── image-transform.dto.ts
│   └── index.ts
├── file.controller.ts
├── file.service.ts
├── file-storage.service.ts
├── image-processor.service.ts
├── file.module.ts
└── README.md
```

## Конфигурация

Добавьте в `.env`:

```env
# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_TOKEN="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="your-bucket-name"
CLOUDFLARE_R2_S3_API=""  # Optional: Custom S3 endpoint

# File Upload Settings
FILE_UPLOAD_MAX_SIZE=10485760        # 10MB
FILE_UPLOAD_IMAGE_MAX_SIZE=5242880   # 5MB
FILE_UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,application/pdf,..."
```

### Получение Cloudflare R2 credentials

1. Создайте R2 bucket в Cloudflare Dashboard
2. Получите Account ID из Cloudflare Dashboard
3. Создайте API Token в R2 разделе с правами на запись/чтение
4. Настройте bucket name согласно вашим требованиям

## API Endpoints

### POST /api/v1/files/upload

Загрузить файл

**Body (multipart/form-data):**

- `file`: File (required)
- `category`: FileCategory
- `title`: string (optional)
- `description`: string (optional)
- `entityType`: FileEntityType (optional)
- `entityId`: string (optional)

### GET /api/v1/files

Получить список файлов с фильтрацией

**Query params:**

- `entityType`: FileEntityType
- `entityId`: string
- `category`: FileCategory
- `uploadedById`: string
- `page`: number
- `limit`: number

### GET /api/v1/files/:id

Получить метаданные файла

### GET /api/v1/files/:id/download

Скачать файл

### GET /api/v1/files/img/:storedName

Получить изображение с обработкой

**Query params:**

- `width`: number (1-4096)
- `height`: number (1-4096)
- `fit`: 'cover' | 'contain' | 'fill'
- `quality`: number (1-100)

**Примеры:**

```
/api/v1/files/img/abc-123.jpg?width=500&height=500
/api/v1/files/img/abc-123.jpg?width=300&quality=70
```

### PATCH /api/v1/files/:id

Обновить метаданные файла

**Body:**

- `title`: string (optional)
- `description`: string (optional)
- `category`: FileCategory (optional)

### DELETE /api/v1/files/:id

Удалить файл (мягкое удаление)

## Использование

### В других модулях

```typescript
import { FileService } from "@/modules/file/file.service";

@Injectable()
export class SomeService {
  constructor(private readonly fileService: FileService) {}

  async uploadAvatar(file: Express.Multer.File, employeeId: string) {
    return await this.fileService.uploadFile(
      file,
      {
        category: FileCategory.AVATAR,
        entityType: FileEntityType.EMPLOYEE,
        entityId: employeeId,
      },
      organizationId,
      uploadedById
    );
  }
}
```

## Prisma Schema

```prisma
model File {
  id          String   @id @default(uuid())
  filename    String
  storedName  String   @unique
  path        String
  mimeType    String
  size        Int
  title       String?
  description String?
  category    FileCategory @default(GENERAL)
  width       Int?
  height      Int?
  uploadedById String
  uploadedBy   Employee @relation("FileUploadedBy")
  uploadedAt   DateTime @default(now())
  entityType   FileEntityType?
  entityId     String?
  deletedAt    DateTime?
  deletedById  String?
  deletedBy    Employee? @relation("FileDeletedBy")
}

enum FileCategory {
  AVATAR
  DOCUMENT
  ANALYSIS_RESULT
  XRAY
  ULTRASOUND
  PRESCRIPTION
  CONSENT_FORM
  GENERAL
}

enum FileEntityType {
  PATIENT
  SERVICE_ORDER
  EMPLOYEE
  VISIT
  INVOICE
}
```

## Хранение файлов

Файлы сохраняются в Cloudflare R2 по ключам:

```
[organizationId]/YYYY/MM/[fileId]/[filename].[ext]
```

Пример:

```
org-123/2024/11/abc-def-123/document.jpg
```

Cloudflare R2 — это S3-совместимое объектное хранилище с нулевыми расходами на исходящий трафик.

## Безопасность

1. ✅ Валидация типов файлов
2. ✅ Ограничение размера
3. ✅ UUID в именах файлов
4. ✅ Мягкое удаление
5. ✅ Аудит (uploadedBy, deletedBy)
6. ✅ Cloudflare R2 для безопасного хранения
7. ⚠️ TODO: FileAccessGuard для контроля доступа
8. ⚠️ TODO: Rate limiting

## TODO

- [ ] Добавить FileAccessGuard
- [ ] Rate limiting для загрузки
- [ ] Batch upload (несколько файлов)
- [ ] Thumbnail generation для PDF
- [ ] Virus scanning (ClamAV)
- [ ] Watermark для изображений
- [x] Cloud storage integration (Cloudflare R2) ✅
