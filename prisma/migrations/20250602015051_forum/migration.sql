-- DropForeignKey
ALTER TABLE `ForumDiscussion` DROP FOREIGN KEY `ForumDiscussion_teacherSubjectId_fkey`;

-- DropIndex
DROP INDEX `ForumDiscussion_teacherSubjectId_fkey` ON `ForumDiscussion`;

-- AlterTable
ALTER TABLE `ForumDiscussion` ADD COLUMN `teacherAssignedSubjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ForumDiscussion` ADD CONSTRAINT `ForumDiscussion_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumDiscussion` ADD CONSTRAINT `ForumDiscussion_teacherAssignedSubjectId_fkey` FOREIGN KEY (`teacherAssignedSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
