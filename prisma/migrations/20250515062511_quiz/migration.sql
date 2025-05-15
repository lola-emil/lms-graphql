/*
  Warnings:

  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - The values [ESSAY] on the enum `Question_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `AnswerKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Choice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `questionText` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AnswerKey` DROP FOREIGN KEY `AnswerKey_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `Choice` DROP FOREIGN KEY `Choice_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuizSessionAnswer` DROP FOREIGN KEY `QuizSessionAnswer_choiceId_fkey`;

-- DropIndex
DROP INDEX `QuizSessionAnswer_choiceId_fkey` ON `QuizSessionAnswer`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `text`,
    ADD COLUMN `questionText` VARCHAR(191) NOT NULL,
    MODIFY `type` ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHOW_ANSWER') NOT NULL;

-- DropTable
DROP TABLE `AnswerKey`;

-- DropTable
DROP TABLE `Choice`;

-- CreateTable
CREATE TABLE `Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `answerText` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL DEFAULT false,
    `questionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizSessionAnswer` ADD CONSTRAINT `QuizSessionAnswer_choiceId_fkey` FOREIGN KEY (`choiceId`) REFERENCES `Answer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
