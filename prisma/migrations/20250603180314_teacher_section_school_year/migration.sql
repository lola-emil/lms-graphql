-- AlterTable
ALTER TABLE `TeacherSubjectSection` ADD COLUMN `schoolYearId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TeacherSubjectSection` ADD CONSTRAINT `TeacherSubjectSection_schoolYearId_fkey` FOREIGN KEY (`schoolYearId`) REFERENCES `SchoolYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
