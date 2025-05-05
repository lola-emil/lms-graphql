-- CreateTable
CREATE TABLE `MeetingSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `meetingID` INTEGER NOT NULL,
    `hostID` VARCHAR(191) NOT NULL,
    `hostEmail` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `startURL` VARCHAR(191) NOT NULL,
    `joinURL` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdBy` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MeetingSession` ADD CONSTRAINT `MeetingSession_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
