-- Pre-migration: Update all users to USER role before removing old enum values
-- Run this BEFORE the main migration

-- Update all non-SUPER_ADMIN users to have USER role
UPDATE "User" 
SET role = 'USER' 
WHERE role NOT IN ('SUPER_ADMIN', 'USER');

-- Delete EmployeeServiceType records (no longer needed)
DELETE FROM "EmployeeServiceType";

-- Delete ServiceType records (no longer needed)
DELETE FROM "ServiceType";
