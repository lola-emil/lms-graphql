-- DropForeignKey
ALTER TABLE `SubjectMaterial` DROP FOREIGN KEY `SubjectMaterial_teacherSubjectId_fkey`;

-- DropIndex
DROP INDEX `SubjectMaterial_teacherSubjectId_fkey` ON `SubjectMaterial`;

-- AlterTable
ALTER TABLE `SubjectMaterial` ADD COLUMN `teacherAssignedSubjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SubjectMaterial` ADD CONSTRAINT `SubjectMaterial_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectMaterial` ADD CONSTRAINT `SubjectMaterial_teacherAssignedSubjectId_fkey` FOREIGN KEY (`teacherAssignedSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
