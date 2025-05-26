-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_subjectMaterialId_fkey`;

-- DropForeignKey
ALTER TABLE `QuizSession` DROP FOREIGN KEY `QuizSession_quizId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentProgress` DROP FOREIGN KEY `StudentProgress_subjectMaterialId_fkey`;

-- DropForeignKey
ALTER TABLE `SubjectMaterialAttachments` DROP FOREIGN KEY `SubjectMaterialAttachments_subjectMaterialId_fkey`;

-- DropForeignKey
ALTER TABLE `SubjectMaterialQuizQuestions` DROP FOREIGN KEY `SubjectMaterialQuizQuestions_subjectMaterialId_fkey`;

-- DropIndex
DROP INDEX `Question_subjectMaterialId_fkey` ON `Question`;

-- DropIndex
DROP INDEX `QuizSession_quizId_fkey` ON `QuizSession`;

-- DropIndex
DROP INDEX `StudentProgress_subjectMaterialId_fkey` ON `StudentProgress`;

-- DropIndex
DROP INDEX `SubjectMaterialAttachments_subjectMaterialId_fkey` ON `SubjectMaterialAttachments`;

-- DropIndex
DROP INDEX `SubjectMaterialQuizQuestions_subjectMaterialId_fkey` ON `SubjectMaterialQuizQuestions`;

-- AddForeignKey
ALTER TABLE `StudentProgress` ADD CONSTRAINT `StudentProgress_subjectMaterialId_fkey` FOREIGN KEY (`subjectMaterialId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectMaterialAttachments` ADD CONSTRAINT `SubjectMaterialAttachments_subjectMaterialId_fkey` FOREIGN KEY (`subjectMaterialId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectMaterialQuizQuestions` ADD CONSTRAINT `SubjectMaterialQuizQuestions_subjectMaterialId_fkey` FOREIGN KEY (`subjectMaterialId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_subjectMaterialId_fkey` FOREIGN KEY (`subjectMaterialId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizSession` ADD CONSTRAINT `QuizSession_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
