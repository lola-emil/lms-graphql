/*
  Warnings:

  - Made the column `schoolYearId` on table `TeacherSubjectSection` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `TeacherSubjectSection` DROP FOREIGN KEY `TeacherSubjectSection_schoolYearId_fkey`;

-- DropIndex
DROP INDEX `TeacherSubjectSection_schoolYearId_fkey` ON `TeacherSubjectSection`;

-- AlterTable
ALTER TABLE `TeacherSubjectSection` MODIFY `schoolYearId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `TeacherSubjectSection` ADD CONSTRAINT `TeacherSubjectSection_schoolYearId_fkey` FOREIGN KEY (`schoolYearId`) REFERENCES `SchoolYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
