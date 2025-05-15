/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Question` table. All the data in the column will be lost.
  - Added the required column `subjectMaterialId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `SubjectMaterialQuizQuestions` DROP FOREIGN KEY `SubjectMaterialQuizQuestions_questionId_fkey`;

-- DropIndex
DROP INDEX `Question_subjectId_fkey` ON `Question`;

-- DropIndex
DROP INDEX `SubjectMaterialQuizQuestions_questionId_fkey` ON `SubjectMaterialQuizQuestions`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `subjectId`,
    ADD COLUMN `subjectMaterialId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_subjectMaterialId_fkey` FOREIGN KEY (`subjectMaterialId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
