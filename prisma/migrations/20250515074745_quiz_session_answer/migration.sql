/*
  Warnings:

  - You are about to drop the column `choiceId` on the `QuizSessionAnswer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `QuizSessionAnswer` DROP FOREIGN KEY `QuizSessionAnswer_choiceId_fkey`;

-- DropIndex
DROP INDEX `QuizSessionAnswer_choiceId_fkey` ON `QuizSessionAnswer`;

-- AlterTable
ALTER TABLE `QuizSessionAnswer` DROP COLUMN `choiceId`,
    ADD COLUMN `answerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `QuizSessionAnswer` ADD CONSTRAINT `QuizSessionAnswer_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `Answer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
