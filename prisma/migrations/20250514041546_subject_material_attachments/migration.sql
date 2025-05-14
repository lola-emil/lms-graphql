/*
  Warnings:

  - You are about to drop the column `description` on the `SubjectMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `fileURL` on the `SubjectMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `mdContentId` on the `SubjectMaterial` table. All the data in the column will be lost.
  - You are about to drop the `SubjectMaterialMDContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `SubjectMaterial` DROP FOREIGN KEY `SubjectMaterial_mdContentId_fkey`;

-- DropIndex
DROP INDEX `SubjectMaterial_mdContentId_key` ON `SubjectMaterial`;

-- AlterTable
ALTER TABLE `SubjectMaterial` DROP COLUMN `description`,
    DROP COLUMN `fileURL`,
    DROP COLUMN `mdContentId`,
    ADD COLUMN `content` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `SubjectMaterialMDContent`;

-- CreateTable
CREATE TABLE `SubjectMaterialAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileURL` VARCHAR(191) NOT NULL,
    `subjectMaterialId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubjectMaterialAttachments` ADD CONSTRAINT `SubjectMaterialAttachments_subjectMaterialId_fkey` FOREIGN KEY (`subjectMaterialId`) REFERENCES `SubjectMaterial`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
