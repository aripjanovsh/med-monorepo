-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('STANDARD', 'WITHOUT_QUEUE', 'EMERGENCY');

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "visits" DROP COLUMN "type",
ADD COLUMN     "type" "VisitType" NOT NULL DEFAULT 'STANDARD';

-- DropEnum
DROP TYPE "AppointmentType";
