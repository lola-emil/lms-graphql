/*
  Warnings:

  - Added the required column `userId` to the `UserUpdateRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserUpdateRequest` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `UserUpdateRequest` ADD CONSTRAINT `UserUpdateRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
