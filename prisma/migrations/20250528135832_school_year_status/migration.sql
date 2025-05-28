-- DropForeignKey
ALTER TABLE `SchoolYear` DROP FOREIGN KEY `SchoolYear_updatedById_fkey`;

-- DropIndex
DROP INDEX `SchoolYear_updatedById_fkey` ON `SchoolYear`;

-- AlterTable
ALTER TABLE `SchoolYear` MODIFY `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `updatedById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SchoolYear` ADD CONSTRAINT `SchoolYear_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
