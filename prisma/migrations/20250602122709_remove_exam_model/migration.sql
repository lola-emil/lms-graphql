/*
  Warnings:

  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ExamAnswer` DROP FOREIGN KEY `ExamAnswer_examQuestionId_fkey`;

-- DropForeignKey
ALTER TABLE `ExamQuestion` DROP FOREIGN KEY `ExamQuestion_examId_fkey`;

-- DropForeignKey
ALTER TABLE `ExamSession` DROP FOREIGN KEY `ExamSession_examId_fkey`;

-- DropForeignKey
ALTER TABLE `ExamSession` DROP FOREIGN KEY `ExamSession_studentId_fkey`;

-- AlterTable
ALTER TABLE `SubjectMaterial` MODIFY `materialType` ENUM('MODULE', 'QUIZ', 'EXAM') NULL;

-- DropTable
DROP TABLE `Exam`;

-- DropTable
DROP TABLE `ExamAnswer`;

-- DropTable
DROP TABLE `ExamQuestion`;

-- DropTable
DROP TABLE `ExamSession`;
