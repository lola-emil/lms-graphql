/*
  Warnings:

  - Added the required column `teacherSubjectId` to the `SubjectMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `SubjectMaterial` DROP FOREIGN KEY `SubjectMaterial_subjectId_fkey`;

-- DropIndex
DROP INDEX `SubjectMaterial_subjectId_fkey` ON `SubjectMaterial`;

-- AlterTable
ALTER TABLE `SubjectMaterial` ADD COLUMN `subjectMaterialId` INTEGER NULL,
    ADD COLUMN `teacherSubjectId` INTEGER NOT NULL,
    MODIFY `subjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SubjectMaterial` ADD CONSTRAINT `SubjectMaterial_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectMaterial` ADD CONSTRAINT `SubjectMaterial_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
