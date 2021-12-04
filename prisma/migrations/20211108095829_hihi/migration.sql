/*
  Warnings:

  - You are about to drop the column `patientPerHour` on the `Operation` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OperationStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "bloodPressure" TEXT,
ADD COLUMN     "bodyTemperature" TEXT,
ADD COLUMN     "heartBeat" TEXT,
ADD COLUMN     "height" TEXT,
ADD COLUMN     "weight" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "relativePhoneNumber" TEXT;

-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "workplaceId" INTEGER;

-- AlterTable
ALTER TABLE "Operation" DROP COLUMN "patientPerHour",
ADD COLUMN     "patientPerHalfHour" INTEGER;

-- AlterTable
ALTER TABLE "Workplace" ADD COLUMN     "wardId" INTEGER;

-- AddForeignKey
ALTER TABLE "Workplace" ADD FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
