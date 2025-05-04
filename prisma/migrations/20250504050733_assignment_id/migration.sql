/*
  Warnings:

  - Added the required column `assignmentId` to the `AssignmentSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AssignmentSubmission` ADD COLUMN `assignmentId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `AssignmentSubmission` ADD CONSTRAINT `AssignmentSubmission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
