/*
  Warnings:

  - You are about to drop the column `ongoing` on the `MeetingSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MeetingSession` DROP COLUMN `ongoing`,
    ADD COLUMN `authCode` VARCHAR(191) NULL,
    ADD COLUMN `onGoing` BOOLEAN NULL;
