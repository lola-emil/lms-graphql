/*
  Warnings:

  - You are about to drop the column `levelId` on the `Subject` table. All the data in the column will be lost.
  - Added the required column `classLevelId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Subject` DROP FOREIGN KEY `Subject_levelId_fkey`;

-- DropIndex
DROP INDEX `Subject_levelId_fkey` ON `Subject`;

-- AlterTable
ALTER TABLE `Subject` DROP COLUMN `levelId`,
    ADD COLUMN `classLevelId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_classLevelId_fkey` FOREIGN KEY (`classLevelId`) REFERENCES `ClassLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
