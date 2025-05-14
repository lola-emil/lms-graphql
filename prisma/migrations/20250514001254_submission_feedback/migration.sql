/*
  Warnings:

  - Added the required column `teacherId` to the `AssignmentFeedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AssignmentFeedback` ADD COLUMN `teacherId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `AssignmentFeedback` ADD CONSTRAINT `AssignmentFeedback_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
