/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[mdContentId]` on the table `SubjectMaterial` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionTag` DROP FOREIGN KEY `QuestionTag_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionTag` DROP FOREIGN KEY `QuestionTag_tagId_fkey`;

-- DropIndex
DROP INDEX `Question_categoryId_fkey` ON `Question`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `categoryId`,
    ADD COLUMN `subjectId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Subject` ADD COLUMN `coverImgUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `SubjectMaterial` ADD COLUMN `mdContentId` INTEGER NULL;

-- DropTable
DROP TABLE `Category`;

-- DropTable
DROP TABLE `QuestionTag`;

-- DropTable
DROP TABLE `Tag`;

-- CreateTable
CREATE TABLE `SubjectMaterialQuizQuestions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectMaterialId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubjectMaterialMDContent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnswerKey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `explanation` VARCHAR(191) NULL,
    `questionId` INTEGER NOT NULL,

    UNIQUE INDEX `AnswerKey_questionId_key`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `quizId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizSessionAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `choiceId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `SubjectMaterial_mdContentId_key` ON `SubjectMaterial`(`mdContentId`);

-- AddForeignKey
ALTER TABLE `SubjectMaterial` ADD CONSTRAINT `SubjectMaterial_mdContentId_fkey` FOREIGN KEY (`mdContentId`) REFERENCES `SubjectMaterialMDContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectMaterialQuizQuestions` ADD CONSTRAINT `SubjectMaterialQuizQuestions_subjectMaterialId_fkey` FOREIGN KEY (`subjectMaterialId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectMaterialQuizQuestions` ADD CONSTRAINT `SubjectMaterialQuizQuestions_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerKey` ADD CONSTRAINT `AnswerKey_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizSession` ADD CONSTRAINT `QuizSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizSession` ADD CONSTRAINT `QuizSession_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizSessionAnswer` ADD CONSTRAINT `QuizSessionAnswer_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `QuizSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizSessionAnswer` ADD CONSTRAINT `QuizSessionAnswer_choiceId_fkey` FOREIGN KEY (`choiceId`) REFERENCES `Choice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
