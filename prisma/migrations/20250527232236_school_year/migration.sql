/*
  Warnings:

  - Added the required column `createdById` to the `SchoolYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCurrent` to the `SchoolYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `SchoolYear` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SchoolYear` ADD COLUMN `createdById` INTEGER NOT NULL,
    ADD COLUMN `isCurrent` BOOLEAN NOT NULL,
    ADD COLUMN `updatedById` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `SchoolYear` ADD CONSTRAINT `SchoolYear_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SchoolYear` ADD CONSTRAINT `SchoolYear_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
