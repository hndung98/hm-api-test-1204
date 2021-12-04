-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "workplaceId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "emergencyContent" TEXT,
ADD COLUMN     "emergencyPhoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Operation" ALTER COLUMN "patientPerHalfHour" SET DEFAULT 0,
ALTER COLUMN "jobPositionId" DROP DEFAULT;
