/*
  Warnings:

  - Added the required column `score` to the `StudentGrade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StudentGrade` ADD COLUMN `score` DECIMAL(11, 2) NOT NULL;
