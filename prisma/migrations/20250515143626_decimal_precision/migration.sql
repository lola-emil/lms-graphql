/*
  Warnings:

  - You are about to alter the column `hps` on the `Assignment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `score` on the `QuizSession` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `Assignment` MODIFY `hps` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `QuizSession` MODIFY `score` DECIMAL(10, 2) NULL;
