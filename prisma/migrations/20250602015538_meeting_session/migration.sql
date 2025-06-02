/*
  Warnings:

  - Added the required column `teacherSubjectId` to the `MeetingSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MeetingSession` DROP FOREIGN KEY `MeetingSession_teacherAssignedSubjectId_fkey`;

-- DropIndex
DROP INDEX `MeetingSession_teacherAssignedSubjectId_fkey` ON `MeetingSession`;

-- AlterTable
ALTER TABLE `MeetingSession` ADD COLUMN `teacherSubjectId` INTEGER NOT NULL,
    MODIFY `teacherAssignedSubjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MeetingSession` ADD CONSTRAINT `MeetingSession_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeetingSession` ADD CONSTRAINT `MeetingSession_teacherAssignedSubjectId_fkey` FOREIGN KEY (`teacherAssignedSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
