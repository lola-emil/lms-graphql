-- DropForeignKey
ALTER TABLE `StudentGrade` DROP FOREIGN KEY `StudentGrade_teacherSubjectId_fkey`;

-- DropIndex
DROP INDEX `StudentGrade_teacherSubjectId_fkey` ON `StudentGrade`;

-- AlterTable
ALTER TABLE `StudentGrade` ADD COLUMN `teacherAssignedSubjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StudentGrade` ADD CONSTRAINT `StudentGrade_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentGrade` ADD CONSTRAINT `StudentGrade_teacherAssignedSubjectId_fkey` FOREIGN KEY (`teacherAssignedSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
