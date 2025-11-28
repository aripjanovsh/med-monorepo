-- Migration: Simplify permissions - remove Permission table, store permission values directly

-- Step 1: Add new permission column (nullable first)
ALTER TABLE "role_permissions" ADD COLUMN "permission" TEXT;

-- Step 2: Migrate data from permissions table
UPDATE "role_permissions" rp
SET "permission" = p.name
FROM "permissions" p
WHERE rp."permissionId" = p.id;

-- Step 3: Make permission column required
ALTER TABLE "role_permissions" ALTER COLUMN "permission" SET NOT NULL;

-- Step 4: Drop foreign key constraint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- Step 5: Drop old unique index
DROP INDEX "role_permissions_roleId_permissionId_key";

-- Step 6: Drop old permissionId column
ALTER TABLE "role_permissions" DROP COLUMN "permissionId";

-- Step 7: Drop permissions table
DROP TABLE "permissions";

-- Step 8: Drop PermissionAction enum
DROP TYPE "PermissionAction";

-- Step 9: Create new unique index
CREATE UNIQUE INDEX "role_permissions_roleId_permission_key" ON "role_permissions"("roleId", "permission");
