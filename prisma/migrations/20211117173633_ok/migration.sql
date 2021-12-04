-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "medicalExpense" INTEGER;

-- AlterTable
ALTER TABLE "Workplace" ADD COLUMN     "contactPhoneNumber" TEXT,
ADD COLUMN     "latitude" DECIMAL(65,30),
ADD COLUMN     "longitude" DECIMAL(65,30);
