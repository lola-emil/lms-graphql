-- AddForeignKey
ALTER TABLE `ForumDiscussion` ADD CONSTRAINT `ForumDiscussion_teacherSubjectId_fkey` FOREIGN KEY (`teacherSubjectId`) REFERENCES `TeacherAssignedSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
