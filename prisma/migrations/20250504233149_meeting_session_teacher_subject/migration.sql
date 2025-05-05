/*
  Warnings:

  - Added the required column `teacherAssignedSubjectId` to the `MeetingSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MeetingSession` ADD COLUMN `teacherAssignedSubjectId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MeetingSession` ADD CONSTRAINT `MeetingSession_teacherAssignedSubjectId_fkey` FOREIGN KEY (`teacherAssignedSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
