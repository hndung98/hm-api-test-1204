/*
  Warnings:

  - The `introduce` column on the `Doctor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `symptom` column on the `MedicalRecord` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[code]` on the table `Province` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "introduce",
ADD COLUMN     "introduce" TEXT[];

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "symptom",
ADD COLUMN     "symptom" TEXT[];

-- AlterTable
ALTER TABLE "Province" ADD COLUMN     "code" INTEGER,
ADD COLUMN     "codename" TEXT,
ADD COLUMN     "division_type" TEXT,
ADD COLUMN     "phone_code" INTEGER;

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER,
    "codename" TEXT,
    "division_type" TEXT,
    "short_codename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "provinceId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER,
    "codename" TEXT,
    "division_type" TEXT,
    "short_codename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "districtId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District.code_unique" ON "District"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Ward.code_unique" ON "Ward"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Province.code_unique" ON "Province"("code");

-- AddForeignKey
ALTER TABLE "District" ADD FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ward" ADD FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
