/*
  Warnings:

  - You are about to drop the `DoctorMedicine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dose` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ingredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medicine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicineCompany` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DoctorMedicine" DROP CONSTRAINT "DoctorMedicine_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorMedicine" DROP CONSTRAINT "DoctorMedicine_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "Dose" DROP CONSTRAINT "Dose_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "Dose" DROP CONSTRAINT "Dose_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_medicineCompanyId_fkey";

-- DropTable
DROP TABLE "DoctorMedicine";

-- DropTable
DROP TABLE "Dose";

-- DropTable
DROP TABLE "Ingredient";

-- DropTable
DROP TABLE "Medicine";

-- DropTable
DROP TABLE "MedicineCompany";
