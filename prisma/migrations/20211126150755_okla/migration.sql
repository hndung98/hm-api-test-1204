-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'WAITING_PAYMENT';

-- AlterEnum
ALTER TYPE "ReferenceType" ADD VALUE 'MEDICAL_RECORD_FILE';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "isPayment" BOOLEAN DEFAULT false,
ADD COLUMN     "paymentCost" INTEGER,
ADD COLUMN     "paymentDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "medicalFilesId" INTEGER;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "medicalExamination" TEXT[];

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_medicalFilesId_fkey" FOREIGN KEY ("medicalFilesId") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Application.identityCardNumber_unique" RENAME TO "Application_identityCardNumber_key";

-- RenameIndex
ALTER INDEX "Customer.avatarId_unique" RENAME TO "Customer_avatarId_key";

-- RenameIndex
ALTER INDEX "Customer.identityCardNumber_unique" RENAME TO "Customer_identityCardNumber_key";

-- RenameIndex
ALTER INDEX "Customer.userId_unique" RENAME TO "Customer_userId_key";

-- RenameIndex
ALTER INDEX "District.code_unique" RENAME TO "District_code_key";

-- RenameIndex
ALTER INDEX "Doctor.applicationId_unique" RENAME TO "Doctor_applicationId_key";

-- RenameIndex
ALTER INDEX "Doctor.avatarId_unique" RENAME TO "Doctor_avatarId_key";

-- RenameIndex
ALTER INDEX "Doctor.identityCardNumber_unique" RENAME TO "Doctor_identityCardNumber_key";

-- RenameIndex
ALTER INDEX "Doctor.userId_unique" RENAME TO "Doctor_userId_key";

-- RenameIndex
ALTER INDEX "Province.code_unique" RENAME TO "Province_code_key";

-- RenameIndex
ALTER INDEX "Province.name_unique" RENAME TO "Province_name_key";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";

-- RenameIndex
ALTER INDEX "User.phoneNumber_unique" RENAME TO "User_phoneNumber_key";

-- RenameIndex
ALTER INDEX "Ward.code_unique" RENAME TO "Ward_code_key";
