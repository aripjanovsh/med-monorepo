-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3),
ADD COLUMN     "passportIssueDate" TIMESTAMP(3),
ADD COLUMN     "passportIssuedBy" TEXT,
ADD COLUMN     "passportNumber" TEXT,
ADD COLUMN     "passportSeries" TEXT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3),
ADD COLUMN     "passportIssueDate" TIMESTAMP(3),
ADD COLUMN     "passportIssuedBy" TEXT,
ADD COLUMN     "passportNumber" TEXT,
ADD COLUMN     "passportSeries" TEXT;
