/*
  Warnings:

  - Added the required column `teacherSubjectId` to the `StudentGrade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StudentGrade` ADD COLUMN `teacherSubjectId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `StudentGrade` ADD CONSTRAINT `StudentGrade_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
