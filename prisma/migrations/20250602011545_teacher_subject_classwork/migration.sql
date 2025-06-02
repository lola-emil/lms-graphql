/*
  Warnings:

  - Added the required column `teacherSubjectId` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Assignment` DROP FOREIGN KEY `Assignment_teacherAssignedSubjectId_fkey`;

-- DropIndex
DROP INDEX `Assignment_teacherAssignedSubjectId_fkey` ON `Assignment`;

-- AlterTable
ALTER TABLE `Assignment` ADD COLUMN `teacherSubjectId` INTEGER NOT NULL,
    MODIFY `teacherAssignedSubjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_teacherAssignedSubjectId_fkey` FOREIGN KEY (`teacherAssignedSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
