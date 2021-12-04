/*
  Warnings:

  - You are about to drop the column `bloodGroup` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `bloodPressure` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `bodyTemperature` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `heartBeat` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "workplaceId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "bloodGroup",
DROP COLUMN "bloodPressure",
DROP COLUMN "bodyTemperature",
DROP COLUMN "heartBeat",
DROP COLUMN "height",
DROP COLUMN "weight";

-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "bloodPressure" TEXT,
ADD COLUMN     "bodyTemperature" TEXT,
ADD COLUMN     "heartBeat" TEXT,
ADD COLUMN     "height" TEXT,
ADD COLUMN     "weight" TEXT;

-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "jobPositionId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Operation" ADD FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
